package com.example.datn.core.admin.productDetail.model.response;

import com.example.datn.core.admin.product.model.response.ADProductImageSimpleResponse;
import com.example.datn.core.admin.serial.model.response.ADSerialResponse;
import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ADProductDetailResponse {

    private String id;
    private String code;
    private String note;
    private String version;
    private Integer quantity;
    private BigDecimal salePrice;
    private EntityStatus status;

    private String colorId;
    private String colorName;

    private String productId;
    private String productName;

    private String storageCapacityId;
    private String storageCapacityName;
    private String creationDate;

    // Thêm trường ảnh cho biến thể
    private String imageUrl;

    // ID của ảnh được chọn từ sản phẩm mẹ
    private String selectedImageId;

    // Thông tin ảnh đã chọn (để frontend hiển thị trực tiếp)
    private ADProductImageSimpleResponse selectedImage;

    private List<ADSerialResponse> serials;
}
