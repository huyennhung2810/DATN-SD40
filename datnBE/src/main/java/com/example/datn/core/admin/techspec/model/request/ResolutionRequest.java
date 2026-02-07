package com.example.datn.core.admin.techspec.model.request;

import com.example.datn.infrastructure.constant.EntityStatus;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResolutionRequest {

    @Size(max = 100, message = "Tên độ phân giải không được quá 100 ký tự")
    private String name;

    @Size(max = 500, message = "Mô tả không được quá 500 ký tự")
    private String description;

    private EntityStatus status;
}

