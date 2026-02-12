package com.example.datn.core.admin.discountDetail.controller;

import com.example.datn.core.admin.discountDetail.service.DiscountDetailService;
import lombok.extern.slf4j.Slf4j; // Nếu muốn log
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/discount-details")
@CrossOrigin("*") // Cho phép FE gọi API không bị chặn CORS
@Slf4j
public class DiscountDetailController {

    @Autowired
    private DiscountDetailService discountDetailService;

    // API: Lấy danh sách các sản phẩm đang được áp dụng trong một đợt giảm giá cụ thể
    // URL: GET /api/admin/discount-details/by-discount/{idDiscount}
    @GetMapping("/by-discount/{idDiscount}")
    public ResponseEntity<?> getByDiscountId(@PathVariable String idDiscount) {
        log.info("Lấy danh sách sản phẩm chi tiết của đợt giảm giá ID: {}", idDiscount);
        return ResponseEntity.ok(discountDetailService.getByIdDiscount(idDiscount));
    }
}
