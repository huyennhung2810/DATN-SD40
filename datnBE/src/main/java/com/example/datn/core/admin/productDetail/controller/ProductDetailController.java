package com.example.datn.core.admin.productDetail.controller;

import com.example.datn.core.admin.productDetail.service.ProductDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/product-details") // Đường dẫn khớp với Frontend
@CrossOrigin("*") // Cho phép FE gọi API
public class ProductDetailController {

    @Autowired
    private ProductDetailService productDetailService;

    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(required = false) String keyword, // Thêm dòng này
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1000") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        // Truyền keyword xuống Service
        return ResponseEntity.ok(productDetailService.getAll(keyword, pageable));
    }
}
