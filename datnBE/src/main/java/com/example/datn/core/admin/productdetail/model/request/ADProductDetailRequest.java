package com.example.datn.core.admin.productDetail.model.request;

import com.example.datn.core.admin.serial.model.request.ADSerialRequest;
import com.example.datn.infrastructure.constant.EntityStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ADProductDetailRequest {

    @NotBlank(message = "Mã SPCT không được để trống")
    private String code;

    private String version;

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

    private List<ADSerialRequest> serials;

}
