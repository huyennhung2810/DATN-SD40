package com.example.datn.infrastructure.security.response;

import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CurrentUserResponse {
    private String id;
    private String username;
    private String email;
    private String name;
    private String phoneNumber;
    private String employeeImage;
    private EntityStatus status;
    private String role;
    private String code;
}

