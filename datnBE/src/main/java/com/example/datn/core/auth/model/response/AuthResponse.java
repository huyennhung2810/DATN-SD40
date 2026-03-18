package com.example.datn.core.auth.model.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String userId;
    private String username;
    private String fullName;
    private String email;
    private String pictureUrl;
    private List<String> roles;
}
