package com.example.datn.core.client.cart.controller;

import com.example.datn.core.client.cart.model.AddToCartRequest;
import com.example.datn.core.client.cart.service.CartService;
import com.example.datn.core.client.cartDetail.service.CnCartDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/client/cart")
@RequiredArgsConstructor
@CrossOrigin("*")
public class CartController {

    private final CartService cartService;

    private final CnCartDetailService cnCartDetailService;

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(
            // Tạm thời truyền customerId qua URL params. Thực tế đi làm sẽ lấy từ JWT Token.
            @RequestParam("customerId") String customerId,
            @RequestBody AddToCartRequest request) {
        try {
            return ResponseEntity.ok(cnCartDetailService.addToCart(customerId, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("")
    public ResponseEntity<?> getCartDetails(@RequestParam("customerId") String customerId) {
        try {
            return ResponseEntity.ok(cnCartDetailService.getCartDetails(customerId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    // API CẬP NHẬT SỐ LƯỢNG
    @PutMapping("/update/{cartDetailId}")
    public ResponseEntity<?> updateQuantity(
            @PathVariable("cartDetailId") String cartDetailId,
            @RequestParam("quantity") Integer quantity) {
        try {
            cnCartDetailService.updateQuantity(cartDetailId, quantity);
            return ResponseEntity.ok("Cập nhật số lượng thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API XÓA SẢN PHẨM KHỎI GIỎ
    @DeleteMapping("/remove/{cartDetailId}")
    public ResponseEntity<?> deleteCartItem(@PathVariable("cartDetailId") String cartDetailId) {
        try {
            cnCartDetailService.deleteCartDetail(cartDetailId);
            return ResponseEntity.ok("Xóa sản phẩm thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API HỢP NHẤT GIỎ HÀNG KHÁCH (Khi đăng nhập)
    @PostMapping("/merge")
    public ResponseEntity<?> mergeGuestCart(
            @RequestParam("customerId") String customerId,
            @RequestBody com.example.datn.core.client.cart.model.MergeCartRequest request) {
        try {
            cnCartDetailService.mergeGuestCart(customerId, request);
            return ResponseEntity.ok("Hợp nhất giỏ hàng thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
