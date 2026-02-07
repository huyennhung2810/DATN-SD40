package com.example.datn.core.admin.techspec.model.request;

import lombok.Data;

@Data
public class SensorTypeSearchRequest {
    private Integer page;
    private Integer size;
    private String keyword;
    private com.example.datn.infrastructure.constant.EntityStatus status;
}

