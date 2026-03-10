package com.example.datn.infrastructure.security.controller;

import com.example.datn.entity.Employee;
import com.example.datn.entity.RefreshToken;
import com.example.datn.infrastructure.constant.MappingConstants;
import com.example.datn.infrastructure.security.repository.AuthRefreshTokenRepository;
import com.example.datn.infrastructure.security.repository.AuthStaffRepository;
import com.example.datn.infrastructure.security.request.ChangePasswordRequest;
import com.example.datn.infrastructure.security.request.LoginRequest;
import com.example.datn.infrastructure.security.request.RefreshRequest;
import com.example.datn.infrastructure.security.request.UpdateProfileRequest;
import com.example.datn.infrastructure.security.response.AuthTokenResponse;
import com.example.datn.infrastructure.security.response.CurrentUserResponse;
import com.example.datn.infrastructure.security.service.RefreshTokenService;
import com.example.datn.infrastructure.security.service.TokenProvider;
import com.example.datn.infrastructure.security.user.UserPrincipal;
import com.example.datn.utils.DateTimeUtils;
import com.example.datn.utils.SecurityUtils;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.util.Optional;

@RestController
@RequestMapping(MappingConstants.API_AUTH_PREFIX)
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final TokenProvider tokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final AuthRefreshTokenRepository refreshTokenRepository;
    private final AuthStaffRepository staffRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) throws JsonProcessingException {
        String screen = request.getScreen() == null || request.getScreen().isBlank() ? "ADMIN" : request.getScreen();
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        Employee employee = staffRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String accessToken = tokenProvider.createTokenForEmployee(employee, screen);
        String refreshToken = refreshTokenService.createRefreshToken(authentication).getRefreshToken();
        return ResponseEntity.ok(new AuthTokenResponse(accessToken, refreshToken));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody RefreshRequest request) throws JsonProcessingException {
        if (request.getRefreshToken() == null || request.getRefreshToken().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Refresh token không được để trống");
        }
        String screen = request.getScreen() == null || request.getScreen().isBlank() ? "ADMIN" : request.getScreen();

        Optional<RefreshToken> optional = refreshTokenService.findByToken(request.getRefreshToken());
        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token không hợp lệ");
        }
        RefreshToken refreshToken = optional.get();
        if (refreshToken.getRevokedAt() != null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token đã bị vô hiệu hóa");
        }
        RefreshToken verified = refreshTokenService.verifyExpiration(refreshToken);
        if (verified == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token đã hết hạn");
        }

        Employee employee = staffRepository.findById(verified.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String accessToken = tokenProvider.createTokenForEmployee(employee, screen);
        return ResponseEntity.ok(new AuthTokenResponse(accessToken, request.getRefreshToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody(required = false) RefreshRequest request) {
        String refreshToken = request == null ? null : request.getRefreshToken();
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenService.findByToken(refreshToken).ifPresent(rt -> {
                rt.setRevokedAt(DateTimeUtils.getCurrentTimeStampSecond());
                refreshTokenRepository.save(rt);
            });
        } else {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
                refreshTokenRepository.findByUserId(principal.getId()).ifPresent(rt -> {
                    rt.setRevokedAt(DateTimeUtils.getCurrentTimeStampSecond());
                    refreshTokenRepository.save(rt);
                });
            }
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Employee employee = staffRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String role = employee.getAccount() != null && employee.getAccount().getRole() != null
                ? employee.getAccount().getRole().name()
                : null;

        return ResponseEntity.ok(new CurrentUserResponse(
                employee.getId(),
                employee.getAccount() == null ? null : employee.getAccount().getUsername(),
                employee.getEmail(),
                employee.getName(),
                employee.getPhoneNumber(),
                employee.getEmployeeImage(),
                employee.getStatus(),
                role,
                employee.getCode()
        ));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Employee employee = staffRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null) employee.setName(request.getName());
        if (request.getEmail() != null) employee.setEmail(request.getEmail());
        if (request.getPhoneNumber() != null) employee.setPhoneNumber(request.getPhoneNumber());
        if (request.getEmployeeImage() != null) employee.setEmployeeImage(request.getEmployeeImage());
        if (request.getHometown() != null) employee.setHometown(request.getHometown());
        if (request.getProvinceCity() != null) employee.setProvinceCity(request.getProvinceCity());
        if (request.getWardCommune() != null) employee.setWardCommune(request.getWardCommune());

        staffRepository.save(employee);
        return me();
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) throws NoSuchAlgorithmException, InvalidKeySpecException {
        if (request.getOldPassword() == null || request.getOldPassword().isBlank()
                || request.getNewPassword() == null || request.getNewPassword().isBlank()
                || request.getConfirmNewPassword() == null || request.getConfirmNewPassword().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Vui lòng điền đầy đủ thông tin");
        }
        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mật khẩu mới không khớp");
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Employee employee = staffRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (employee.getAccount() == null || employee.getAccount().getSalt() == null || employee.getAccount().getPassword() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tài khoản này không hỗ trợ đổi mật khẩu");
        }

        boolean ok = SecurityUtils.verifyPassword(
                request.getOldPassword(),
                employee.getAccount().getSalt(),
                employee.getAccount().getPassword()
        );
        if (!ok) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mật khẩu cũ không đúng");
        }

        String[] hash = SecurityUtils.hashPassword(request.getNewPassword());
        employee.getAccount().setSalt(hash[0]);
        employee.getAccount().setPassword(hash[1]);
        staffRepository.save(employee);
        return ResponseEntity.ok().build();
    }
}
