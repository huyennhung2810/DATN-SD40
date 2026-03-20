package com.example.datn.core.client.cart.service;

import com.example.datn.entity.Cart;

public interface CartService {

    // Hàm này cực kỳ quan trọng: Tìm giỏ hàng của user, nếu chưa có sẽ tự động tạo mới!
    Cart getOrCreateCart(String customerId);
}
