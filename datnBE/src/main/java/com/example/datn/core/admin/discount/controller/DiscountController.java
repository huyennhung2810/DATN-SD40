package com.example.datn.core.admin.discount.controller;

import com.example.datn.core.admin.discount.model.DiscountRequest;
import com.example.datn.core.admin.discount.service.DiscountService;
import com.example.datn.core.admin.vouchers.model.request.ADVoucherSearchRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/discounts")
@CrossOrigin("*")
@Slf4j
public class DiscountController {

    @Autowired
    private DiscountService discountService;


    // 1. Lấy danh sách kèm phân trang và tìm kiếm
    @GetMapping
    public ResponseEntity<?> getAll(ADVoucherSearchRequest request) {
        log.info("Request: Lấy danh sách đợt giảm giá với params: {}", request);
        return ResponseEntity.ok(discountService.getAll(request));
    }

    // 2. Lấy chi tiết một Discount (Bao gồm cả danh sách sản phẩm áp dụng)
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable String id) {
        log.info("Request: Lấy chi tiết đợt giảm giá ID: {}", id);
        return ResponseEntity.ok(discountService.getOne(id));
    }

    // 3. Thêm mới đợt giảm giá
    // @Valid giúp kiểm tra các ràng buộc @Min, @Max, @NotBlank trong DiscountRequest
    @PostMapping
    public ResponseEntity<?> add(@Valid @RequestBody DiscountRequest request) {
        log.info("Request: Tạo mới đợt giảm giá: {}", request.getName());
        return new ResponseEntity<>(discountService.add(request), HttpStatus.CREATED);
    }

    // 4. Cập nhật đợt giảm giá
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable String id,
            @Valid @RequestBody DiscountRequest request
    ) {
        log.info("Request: Cập nhật đợt giảm giá ID: {}", id);
        return ResponseEntity.ok(discountService.update(id, request));
    }

    // 5. Đổi trạng thái (Kích hoạt/Ngưng kích hoạt)
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> changeStatus(@PathVariable String id) {
        log.info("Request: Thay đổi trạng thái đợt giảm giá ID: {}", id);
        discountService.changeStatus(id);
        return ResponseEntity.ok("Cập nhật trạng thái thành công");
    }

}

