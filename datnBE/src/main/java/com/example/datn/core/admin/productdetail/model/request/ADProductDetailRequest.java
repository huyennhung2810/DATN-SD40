package com.example.datn.core.admin.productdetail.model.request;

import com.example.datn.core.admin.serial.model.request.ADSerialRequest;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.ProductVersion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ADProductDetailRequest {

    @NotBlank(message = "Mã SPCT không được để trống")
    private String code;

    // Tên phiên bản hiển thị (format: "{VariantVersion} / {Color} / {Storage}")
    private String version;

    // Phiên bản máy ảnh Canon - dimension bắt buộc cấp 1
    // Giá trị: BODY_ONLY, KIT_18_45, KIT_18_150
    // LEVEL 1: Validation bắt buộc, chỉ chấp nhận 3 giá trị hợp lệ
    @NotBlank(message = "Phiên bản không được để trống")
    private String variantVersion;

    private String note;

    private Integer quantity;

    @NotNull(message = "Giá bán không được để trống")
    private BigDecimal salePrice;

    @NotNull(message = "Trạng thái không được để trống")
    private EntityStatus status;

    @NotNull(message = "Màu sắc không được để trống")
    private String colorId;

    // ProductId có thể optional (trong API mới lấy từ URL path)
    private String productId;

    @NotNull(message = "Dung lượng không được để trống")
    private String storageCapacityId;

    // Ảnh cũ của biến thể (url trực tiếp)
    private String imageUrl;

    // ID của ảnh được chọn từ sản phẩm mẹ - dùng để liên kết với ProductImage
    private String selectedImageId;
    private List<String> newSerials;

    private List<ADSerialRequest> serials;

}
