package com.example.datn.core.admin.techspec.model.request;

import com.example.datn.entity.TechSpecDefinition;
import com.example.datn.infrastructure.constant.EntityStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TechSpecDefinitionRequest {

    private String id;

    @NotBlank(message = "Tên thông số không được để trống")
    @Size(max = 255, message = "Tên thông số không được quá 255 ký tự")
    private String name;

    @Size(max = 100, message = "Mã thông số không được quá 100 ký tự")
    private String code;

    @NotNull(message = "Nhóm thông số không được để trống")
    private String groupId;

    @Size(max = 1000, message = "Mô tả không được quá 1000 ký tự")
    private String description;

    @NotNull(message = "Kiểu dữ liệu không được để trống")
    private TechSpecDefinition.DataType dataType;

    @Size(max = 50, message = "Đơn vị không được quá 50 ký tự")
    private String unit;

    private Boolean isFilterable = false;

    private Boolean isRequired = false;

    private Integer displayOrder;

    private EntityStatus status;
}
