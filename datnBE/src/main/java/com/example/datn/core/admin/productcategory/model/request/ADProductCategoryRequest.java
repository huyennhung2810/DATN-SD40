package com.example.datn.core.admin.productcategory.model.request;

import com.example.datn.infrastructure.constant.EntityStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ADProductCategoryRequest {
    
    private String id;
    
    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(max = 100, message = "Tên danh mục không được quá 100 ký tự")
    private String name;
    
    @NotBlank(message = "Mã danh mục không được để trống")
    @Size(max = 20, message = "Mã danh mục không được quá 20 ký tự")
    private String code;
    
    @Size(max = 500, message = "Mô tả không được quá 500 ký tự")
    private String description;
    
    private EntityStatus status = EntityStatus.ACTIVE;
}