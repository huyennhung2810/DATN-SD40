package com.example.datn.core.admin.discountDetail.controller;

import com.example.datn.core.admin.discountDetail.model.request.ADDiscountDetailRequest;
import com.example.datn.core.admin.discountDetail.service.ADDiscountDetailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/discount-details")
@RequiredArgsConstructor
@Slf4j
public class ADDiscountDetailController {
    private final ADDiscountDetailService adDiscountDetailService;

    @PostMapping("/apply")
    public ResponseEntity<?> apply(@RequestBody ADDiscountDetailRequest request) {
        log.info("Áp dụng giảm giá ID {} cho {} sản phẩm", request.getIdDiscount(), request.getIdProductDetails().size());
        return ResponseEntity.ok(adDiscountDetailService.applyDiscountToProducts(request));
    }
}
