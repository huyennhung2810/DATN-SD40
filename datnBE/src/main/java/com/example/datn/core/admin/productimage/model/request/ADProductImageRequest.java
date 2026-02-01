package com.example.datn.core.admin.productimage.model.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ADProductImageRequest {
    
    @NotNull(message = "ID sản phẩm không được để trống")
    private String idProduct;
    
    private Integer displayOrder;
    
    @NotNull(message = "URL ảnh không được để trống")
    private String url;
}