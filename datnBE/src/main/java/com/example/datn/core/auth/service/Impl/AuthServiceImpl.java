package com.example.datn.core.auth.service.Impl;

import com.example.datn.core.auth.model.request.*;
import com.example.datn.core.auth.model.response.AuthResponse;
import com.example.datn.core.auth.service.AuthService;
import com.example.datn.entity.Account;
import com.example.datn.entity.Customer;
import com.example.datn.entity.Employee;
import com.example.datn.entity.RefreshToken;
import com.example.datn.infrastructure.constant.AuthProvider;
import com.example.datn.infrastructure.constant.RoleConstant;
import com.example.datn.infrastructure.email.EmailService;
import com.example.datn.infrastructure.exception.ServiceException;
import com.example.datn.infrastructure.security.repository.AuthCustomerRepository;
import com.example.datn.infrastructure.security.repository.AuthRefreshTokenRepository;
import com.example.datn.infrastructure.security.repository.AuthRoleRepository;
import com.example.datn.infrastructure.security.repository.AuthStaffRepository;
import com.example.datn.infrastructure.security.service.RefreshTokenService;
import com.example.datn.infrastructure.security.service.TokenProvider;
import com.example.datn.repository.AccountRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final TokenProvider tokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final AuthStaffRepository staffRepository;
    private final AuthCustomerRepository customerRepository;
    private final AuthRoleRepository roleRepository;
    private final AccountRepository accountRepository;
    private final AuthRefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    //login kh
    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticate(request.getUsername(), request.getPassword());

        List<String> roles = roleRepository.getRoleCodeByUsername(request.getUsername());

        if (roles.stream().noneMatch(r -> r.equals(RoleConstant.CUSTOMER.name()))) {
            throw new ServiceException("Tài khoản không có quyền truy cập");
        }

        return buildResponse(request.getUsername(), authentication, roles);
    }

    //login admin-nv
    @Override
    @Transactional
    public AuthResponse loginAdmin(LoginRequest request) {
        Authentication authentication = authenticate(request.getUsername(), request.getPassword());

        List<String> roles = roleRepository.getRoleCodeByUsername(request.getUsername());
        boolean isStaff = roles.stream()
                .anyMatch(r -> r.equals(RoleConstant.ADMIN.name()) || r.equals(RoleConstant.STAFF.name()));

        if (!isStaff) {
            throw new ServiceException("Tài khoản không có quyền truy cập hệ thống quản lý");
        }

        return buildResponse(request.getUsername(), authentication, roles);
    }



    @Override
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        Optional<RefreshToken> optToken = refreshTokenService.findByToken(request.getRefreshToken());

        if (optToken.isEmpty()) {
            throw new ServiceException("Refresh token không hợp lệ");
        }

        RefreshToken refreshToken = refreshTokenService.verifyExpiration(optToken.get());
        if (refreshToken == null) {
            throw new ServiceException("Refresh token đã hết hạn, vui lòng đăng nhập lại");
        }

        // Tìm user theo userId trong refreshToken
        String userId = refreshToken.getUserId();

        Optional<Employee> optStaff = staffRepository.findById(userId);
        if (optStaff.isPresent()) {
            Employee staff = optStaff.get();
            List<String> roles = roleRepository.getRoleCodeByUsername(staff.getAccount().getUsername());
            Map<String, Object> claims = buildClaims(staff, roles);
            try {
                String newAccessToken = tokenProvider.generateToken(claims);
                return AuthResponse.builder()
                        .accessToken(newAccessToken)
                        .refreshToken(refreshToken.getRefreshToken())
                        .userId(staff.getId())
                        .username(staff.getAccount().getUsername())
                        .fullName(staff.getName())
                        .email(staff.getEmail())
                        .roles(roles)
                        .build();
            } catch (JsonProcessingException e) {
                throw new ServiceException("Không thể tạo token");
            }
        }

        Optional<Customer> optCustomer = customerRepository.findById(userId);
        if (optCustomer.isPresent()) {
            Customer customer = optCustomer.get();
            List<String> roles = roleRepository.getRoleCodeByUsername(customer.getAccount().getUsername());
            Map<String, Object> claims = buildClaims(customer, roles);
            try {
                String newAccessToken = tokenProvider.generateToken(claims);
                return AuthResponse.builder()
                        .accessToken(newAccessToken)
                        .refreshToken(refreshToken.getRefreshToken())
                        .userId(customer.getId())
                        .username(customer.getAccount().getUsername())
                        .fullName(customer.getName())
                        .email(customer.getEmail())
                        .roles(roles)
                        .build();
            } catch (JsonProcessingException e) {
                throw new ServiceException("Không thể tạo token");
            }
        }

        throw new ServiceException("Không tìm thấy người dùng");
    }


    @Override
    @Transactional
    public void logout(String userId) {
        Optional<RefreshToken> optToken = refreshTokenRepository.findByUserId(userId);
        optToken.ifPresent(t -> {
            t.setRevokedAt(System.currentTimeMillis());
            refreshTokenRepository.save(t);
        });
    }


    @Override
    @Transactional
    public void register(RegisterRequest request) {
        if (accountRepository.existsByUsername(request.getUsername())) {
            throw new ServiceException("Tên đăng nhập đã tồn tại");
        }

        Optional<Customer> existingCustomer = customerRepository.findByEmail(request.getEmail());
        if (existingCustomer.isPresent()) {
            throw new ServiceException("Email đã được sử dụng");
        }

        Account account = Account.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(RoleConstant.CUSTOMER)
                .provider(AuthProvider.local)
                .build();
        accountRepository.save(account);

        Customer customer = new Customer();
        customer.setName(request.getFullName());
        customer.setEmail(request.getEmail());
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setAccount(account);
        customerRepository.save(customer);

        log.info("Registered new customer: {}", request.getUsername());
    }


    @Override
    @Transactional
    public void changePassword(String userId, ChangePasswordRequest request) {
        // Tìm account qua Employee hoặc Customer
        Optional<Employee> optStaff = staffRepository.findById(userId);
        Account account = null;
        if (optStaff.isPresent()) {
            account = optStaff.get().getAccount();
        } else {
            Optional<Customer> optCustomer = customerRepository.findById(userId);
            if (optCustomer.isPresent()) {
                account = optCustomer.get().getAccount();
            }
        }

        if (account == null) {
            throw new ServiceException("Không tìm thấy tài khoản");
        }

        if (!passwordEncoder.matches(request.getOldPassword(), account.getPassword())) {
            throw new ServiceException("Mật khẩu cũ không đúng");
        }

        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);
    }


    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        // Tìm account qua Employee email
        Optional<Employee> optStaff = staffRepository.findByEmail(request.getEmail());
        Account account = null;
        String fullName = "Người dùng";

        if (optStaff.isPresent()) {
            account = optStaff.get().getAccount();
            fullName = optStaff.get().getName();
        } else {
            Optional<Customer> optCustomer = customerRepository.findByEmail(request.getEmail());
            if (optCustomer.isPresent()) {
                account = optCustomer.get().getAccount();
                fullName = optCustomer.get().getName();
            }
        }

        if (account == null) {
            throw new ServiceException("Email không tồn tại trong hệ thống");
        }

        String otp = generateOtp();
        long expiry = System.currentTimeMillis() + 5 * 60 * 1000;

        account.setOtpCode(otp);
        account.setOtpExpiryTime(expiry);
        accountRepository.save(account);

        emailService.sendOtpEmail(request.getEmail(), fullName, otp);
        log.info("OTP sent to email: {}", request.getEmail());
    }


    @Override
    @Transactional
    public void verifyOtp(VerifyOtpRequest request) {
        // Tìm account qua Employee email
        Optional<Employee> optStaff = staffRepository.findByEmail(request.getEmail());
        Account account = null;

        if (optStaff.isPresent()) {
            account = optStaff.get().getAccount();
        } else {
            Optional<Customer> optCustomer = customerRepository.findByEmail(request.getEmail());
            if (optCustomer.isPresent()) {
                account = optCustomer.get().getAccount();
            }
        }

        if (account == null) {
            throw new ServiceException("Email không tồn tại trong hệ thống");
        }

        if (account.getOtpCode() == null || !account.getOtpCode().equals(request.getOtpCode())) {
            throw new ServiceException("Mã OTP không hợp lệ");
        }

        if (account.getOtpExpiryTime() == null || account.getOtpExpiryTime() < System.currentTimeMillis()) {
            throw new ServiceException("Mã OTP đã hết hạn");
        }

        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        account.setOtpCode(null);
        account.setOtpExpiryTime(null);
        accountRepository.save(account);
        log.info("Password reset for email: {}", request.getEmail());
    }


    private Authentication authenticate(String username, String password) {
        try {
            return authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );
        } catch (BadCredentialsException e) {
            throw new ServiceException("Tên đăng nhập hoặc mật khẩu không đúng");
        } catch (AuthenticationException e) {
            throw new ServiceException("Xác thực thất bại: " + e.getMessage());
        }
    }

    private AuthResponse buildResponse(String username, Authentication authentication, List<String> roles) {

        Optional<Employee> optStaff = staffRepository.findByUsername(username);
        if (optStaff.isPresent()) {
            Employee staff = optStaff.get();
            Map<String, Object> claims = buildClaims(staff, roles);
            try {
                String accessToken = tokenProvider.generateToken(claims);
                RefreshToken refreshToken = refreshTokenService.createRefreshToken(staff.getId());

                return AuthResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(refreshToken.getRefreshToken())
                        .userId(staff.getId())
                        .username(username)
                        .fullName(staff.getName())
                        .email(staff.getEmail())
                        .pictureUrl(staff.getEmployeeImage())
                        .roles(roles)
                        .build();

            } catch (JsonProcessingException e) {
                throw new ServiceException("Không thể tạo token");
            }
        }

        Optional<Customer> optCustomer = customerRepository.findByAccountUsername(username);
        if (optCustomer.isPresent()) {
            Customer customer = optCustomer.get();
            Map<String, Object> claims = buildClaims(customer, roles);

            try {
                String accessToken = tokenProvider.generateToken(claims);
                RefreshToken refreshToken = refreshTokenService.createRefreshToken(customer.getId());

                return AuthResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(refreshToken.getRefreshToken())
                        .userId(customer.getId())
                        .username(username)
                        .fullName(customer.getName())
                        .email(customer.getEmail())
                        .pictureUrl(customer.getImage())
                        .roles(roles)
                        .build();

            } catch (JsonProcessingException e) {
                throw new ServiceException("Không thể tạo token");
            }
        }

        throw new ServiceException("Không tìm thấy người dùng");
    }

    private Map<String, Object> buildClaims(Employee staff, List<String> roles) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", staff.getId());
        claims.put("userCode", staff.getCode());
        claims.put("username", staff.getAccount().getUsername());
        claims.put("fullName", staff.getName());
        claims.put("pictureUrl", staff.getEmployeeImage());
        claims.put("rolesCode", roles);
        claims.put("rolesName", roles);
        claims.put("email", staff.getEmail() != null ? staff.getEmail() : "");
        claims.put("roleSwitch", "true");
        return claims;
    }

    private Map<String, Object> buildClaims(Customer customer, List<String> roles) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", customer.getId());



        claims.put("userCode", customer.getCode());
        claims.put("username", customer.getAccount().getUsername());
        claims.put("fullName", customer.getName());
        claims.put("pictureUrl", customer.getImage());
        claims.put("rolesCode", roles);
        claims.put("rolesName", roles);
        claims.put("email", customer.getEmail() != null ? customer.getEmail() : "");
        claims.put("roleSwitch", "false");
        return claims;
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}