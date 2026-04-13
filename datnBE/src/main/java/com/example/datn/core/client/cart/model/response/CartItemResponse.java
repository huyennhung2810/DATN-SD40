package com.example.datn.core.client.cart.model.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CartItemResponse {
    private String id;          // ID của bảng CartDetail (Dùng để Xóa / Cập nhật số lượng)
    /** ID biến thể (ProductDetail) — dùng khi gửi checkout */
    private String productDetailId;
    private String productId;   // ID của Product cha
    private String productName; // Tên sản phẩm
    private String imageUrl;    // Ảnh đại diện
    private BigDecimal price;       // Giá
    private Integer quantity;   // Số lượng khách chọn
    private Integer stock;      // Tồn kho hiện tại
    private BigDecimal discountedPrice;
    private String version;
}