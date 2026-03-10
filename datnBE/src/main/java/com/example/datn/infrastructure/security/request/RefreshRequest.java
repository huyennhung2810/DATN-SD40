package com.example.datn.infrastructure.security.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RefreshRequest {
    private String refreshToken;
    private String screen;
}

