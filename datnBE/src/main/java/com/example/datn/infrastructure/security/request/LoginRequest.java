package com.example.datn.infrastructure.security.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    private String usernameOrEmail;
    private String password;
    /**
     * Role screen de xac dinh loai nguoi dung (ADMIN, STAFF, CUSTOMER).
     * Frontend admin truyen gia tri ADMIN.
     */
    private String screen;
}
