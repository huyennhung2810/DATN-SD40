package com.example.datn.core.admin.product.model.request;

import com.example.datn.infrastructure.constant.EntityStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ADProductRequest {
    
    private String id;
    
    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;
    
    private String description;
    
    // null cũng được :_))
    private String idProductCategory;

    private String idTechSpec;
    
    private EntityStatus status = EntityStatus.ACTIVE;
    
    // Lấy urls
    private List<String> imageUrls;
}