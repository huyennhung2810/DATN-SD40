package com.example.datn.core.admin.discount.controller;
import com.example.datn.core.admin.discount.model.ADDiscountSearchRequest;
import com.example.datn.core.admin.discount.model.PostOrPutDiscountDto;
import com.example.datn.core.admin.discount.service.ADDiscountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/discounts")
@RequiredArgsConstructor
@Slf4j
public class ADDiscountController {
    private final ADDiscountService adDiscountService;

    // 1. Lấy danh sách + Tìm kiếm + Phân trang
    @GetMapping
    public ResponseEntity<?> getAllDiscounts(ADDiscountSearchRequest request) {
        log.info("Tìm kiếm đợt giảm giá với tham số: {}", request);
        return ResponseEntity.ok(adDiscountService.getAllDiscounts(request));
    }

    // 2. Lấy chi tiết một đợt giảm giá
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        log.info("Truy vấn chi tiết giảm giá ID: {}", id);
        return ResponseEntity.ok(adDiscountService.getById(id));
    }

    // 3. Thêm mới đợt giảm giá
    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody PostOrPutDiscountDto dto) {
        log.info("Hành động: Thêm mới giảm giá - Data: {}", dto);
        return ResponseEntity.ok(adDiscountService.createOrUpdate(null, dto));
    }

    // 4. Cập nhật đợt giảm giá
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @Valid @RequestBody PostOrPutDiscountDto dto) {
        log.info("Hành động: Cập nhật giảm giá ID: {} - Data: {}", id, dto);
        return ResponseEntity.ok(adDiscountService.createOrUpdate(id, dto));
    }

    // 5. Xóa đợt giảm giá
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        log.info("Hành động: Xóa giảm giá ID: {}", id);
        return ResponseEntity.ok(adDiscountService.delete(id));
    }
}
