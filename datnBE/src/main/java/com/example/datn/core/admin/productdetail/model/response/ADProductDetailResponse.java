package com.example.datn.core.admin.productdetail.model.response;

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

    // Tên phiên bản hiển thị đầy đủ (format: "{VariantVersion} / {Color} / {Storage}")
    private String version;

    // Phiên bản máy ảnh Canon - dimension bắt buộc cấp 1
    // Giá trị: BODY_ONLY, KIT_18_45, KIT_18_150
    private String variantVersion;

    // Display name của variantVersion (VD: "Body Only", "Kit 18-45", "Kit 18-150")
    private String variantVersionDisplayName;

    private Integer quantity;
    private BigDecimal salePrice;
    private EntityStatus status;

    private String colorId;
    private String colorName;

    private String productId;

    private String productCode;

    private String productName;

    private String storageCapacityId;
    private String storageCapacityName;
    private String creationDate;

    private BigDecimal discountedPrice;

    // Thêm trường ảnh cho biến thể
    private String imageUrl;

    // ID của ảnh được chọn từ sản phẩm mẹ
    private String selectedImageId;

    // Thông tin ảnh đã chọn (để frontend hiển thị trực tiếp)
    private ADProductImageSimpleResponse selectedImage;

    private List<ADSerialResponse> serials;
}
