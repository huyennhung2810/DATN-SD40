package com.example.datn.core.auth.controller;

import com.example.datn.core.auth.model.request.*;
import com.example.datn.core.auth.model.response.AuthResponse;
import com.example.datn.core.auth.service.AuthService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.config.global.GlobalVariables;
import com.example.datn.infrastructure.constant.GlobalVariablesConstant;
import com.example.datn.infrastructure.constant.MappingConstants;
import com.example.datn.infrastructure.security.user.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(MappingConstants.API_AUTH_PREFIX)
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final GlobalVariables globalVariables;

    //kh login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ResponseObject.success(response, "Đăng nhập thành công"));
    }

    //đăng nhập admin-nv
    @PostMapping("/login-admin")
    public ResponseEntity<?> loginAdmin(@RequestBody LoginRequest request) {
        AuthResponse response = authService.loginAdmin(request);
        return ResponseEntity.ok(ResponseObject.success(response, "Đăng nhập thành công"));
    }

    //đăng ký
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(ResponseObject.success("Đăng ký thành công"));
    }

    //cấp lại token
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ResponseObject.success(response, "Làm mới token thành công"));
    }

   //đăng xuất
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String userId = principal.getId();
        return ResponseEntity.ok(ResponseObject.success("Đăng xuất thành công"));
    }

    //đổi mk
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        String userId = (String) globalVariables.getGlobalVariable(GlobalVariablesConstant.CURRENT_USER_ID);
        authService.changePassword(userId, request);
        return ResponseEntity.ok(ResponseObject.success("Đổi mật khẩu thành công"));
    }

    //gửi mail quên mk
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ResponseObject.success("OTP đã được gửi đến email của bạn"));
    }

    //xác thực otp, đặt lại mmk
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        authService.verifyOtp(request);
        return ResponseEntity.ok(ResponseObject.success("Đặt lại mật khẩu thành công"));
    }
}