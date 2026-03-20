package com.example.datn.core.client.product.model.response;



import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CnVariantResponse {
    private String id; // ĐÂY CHÍNH LÀ ID CỦA PRODUCT DETAIL (Dùng để thêm vào giỏ)
    private String name; // Tên biến thể (VD: "Màu Đen - 256GB")
    private BigDecimal price; // Giá của riêng biến thể này
    private Integer stock; // Số lượng tồn kho
}