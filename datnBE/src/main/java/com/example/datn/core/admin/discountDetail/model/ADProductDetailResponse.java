package com.example.datn.core.admin.discountDetail.model;

import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ADProductDetailResponse implements Serializable {

    private String id;
    private String code;            // Mã sản phẩm chi tiết
    private String productName;     // Tên sản phẩm
    private String colorName;       // Màu sắc
    private String storageCapacityName; // Dung lượng
    private String version;         // Cấu hình
    private BigDecimal salePrice;       // Giá bán (có thể đổi thành BigDecimal nếu project của bạn dùng BigDecimal)
    private Integer quantity;       // Số lượng
    private EntityStatus status;         // Trạng thái
    private String note;            // Ghi chú (nếu cần)
    private String creationDate;    // Ngày tạo (chuỗi đã format)

}
