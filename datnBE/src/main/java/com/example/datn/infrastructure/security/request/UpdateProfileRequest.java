package com.example.datn.infrastructure.security.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileRequest {
    private String name;
    private String email;
    private String phoneNumber;
    private String employeeImage;
    private String hometown;
    private String provinceCity;
    private String wardCommune;
}

