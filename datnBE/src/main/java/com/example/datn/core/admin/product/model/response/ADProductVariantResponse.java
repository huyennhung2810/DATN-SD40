package com.example.datn.core.admin.product.model.response;

import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ADProductVariantResponse {
    
    private String id;
    
    private String code;
    
    private String version;
    
    private String colorId;
    
    private String colorName;
    
    private String colorCode;
    
    private String storageCapacityId;
    
    private String storageCapacityName;
    
    private BigDecimal salePrice;
    
    private Integer quantity;
    
    private EntityStatus status;
    
    private List<String> imageUrls;

    // Ảnh cũ của biến thể (url trực tiếp)
    private String imageUrl;

    // ID của ảnh được chọn từ sản phẩm mẹ - dùng để liên kết với ProductImage
    private String selectedImageId;

    // URL của ảnh đại diện (có thể từ selectedImageId hoặc imageUrl)
    private String selectedImageUrl;
}
