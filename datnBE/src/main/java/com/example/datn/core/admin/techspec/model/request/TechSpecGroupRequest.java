package com.example.datn.core.admin.techspec.model.request;

import com.example.datn.infrastructure.constant.EntityStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TechSpecGroupRequest {

    private String id;

    @NotBlank(message = "Tên nhóm thông số không được để trống")
    @Size(max = 255, message = "Tên nhóm không được quá 255 ký tự")
    private String name;

    @Size(max = 100, message = "Mã nhóm không được quá 100 ký tự")
    private String code;

    @Size(max = 1000, message = "Mô tả không được quá 1000 ký tự")
    private String description;

    private Integer displayOrder;

    private EntityStatus status;
}
