package com.example.datn.core.auth.model.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private String fullName;
    private String email;
    private String phoneNumber;
    private String username;
    private String password;
}
