package com.example.datn.core.auth.service;

import com.example.datn.core.auth.model.request.*;
import com.example.datn.core.auth.model.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse loginAdmin(LoginRequest request);
    AuthResponse refreshToken(RefreshTokenRequest request);
    void logout(String userId);
    void register(RegisterRequest request);
    void changePassword(String userId, ChangePasswordRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void verifyOtp(VerifyOtpRequest request);
}
