package com.example.datn.core.admin.discountDetail.controller;

import com.example.datn.core.admin.discountDetail.service.ProductDetailForDiscountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/product-details-discount") // Đường dẫn khớp với Frontend
@CrossOrigin("*") // Cho phép FE gọi API
public class ProductDetailForDiscountController {

    @Autowired
    private ProductDetailForDiscountService productDetailForDiscountService;

    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String currentDiscountId, // THÊM PARAM NÀY
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1000") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        // Truyền cả currentDiscountId xuống Service
        return ResponseEntity.ok(productDetailForDiscountService.getAll(keyword, currentDiscountId, pageable));
    }
}
