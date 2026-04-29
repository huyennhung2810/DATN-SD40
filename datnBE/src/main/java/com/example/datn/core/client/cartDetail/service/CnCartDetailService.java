package com.example.datn.core.client.cartDetail.service;

import com.example.datn.core.client.cart.model.AddToCartRequest;
import com.example.datn.core.client.cart.model.MergeCartRequest;
import com.example.datn.core.client.cart.model.response.CartItemResponse;
import com.example.datn.entity.CartDetail;

import java.util.List;

public interface CnCartDetailService {

    // Hàm thêm sản phẩm vào giỏ
    CartDetail addToCart(String customerId, AddToCartRequest request);
    List<CartItemResponse> getCartDetails(String customerId);
    void updateQuantity(String cartDetailId, Integer quantity);
    void deleteCartDetail(String cartDetailId);
    
    // Hàm hợp nhất giỏ hàng khách (dùng khi đăng nhập)
    void mergeGuestCart(String customerId, MergeCartRequest request);
}