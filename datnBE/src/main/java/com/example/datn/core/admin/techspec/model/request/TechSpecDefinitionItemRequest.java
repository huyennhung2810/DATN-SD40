package com.example.datn.core.admin.techspec.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TechSpecDefinitionItemRequest {

    private String id;

    @NotBlank(message = "Tên giá trị không được để trống")
    @Size(max = 255, message = "Tên không được quá 255 ký tự")
    private String name;

    @Size(max = 500, message = "Giá trị không được quá 500 ký tự")
    private String value;

    private Integer displayOrder;

    private String status;

    @NotBlank(message = "Thiếu thông số kỹ thuật cha")
    private String definitionId;
}
