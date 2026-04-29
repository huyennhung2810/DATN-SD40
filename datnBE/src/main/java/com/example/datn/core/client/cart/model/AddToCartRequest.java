package com.example.datn.core.client.cart.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddToCartRequest {
    private String productDetailId; // ID của biến thể sản phẩm khách chọn
    private Integer quantity;       // Số lượng khách muốn thêm
}
