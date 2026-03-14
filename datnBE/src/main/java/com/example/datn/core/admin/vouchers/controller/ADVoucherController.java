package com.example.datn.core.admin.vouchers.controller;


import com.example.datn.core.admin.voucherDetail.service.ADVoucherDetailService;
import com.example.datn.core.admin.vouchers.model.PostOrPutVoucherDto;
import com.example.datn.core.admin.vouchers.model.request.ADVoucherSearchRequest;
import com.example.datn.core.admin.vouchers.service.ADVoucherService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.MappingConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/vouchers")
@RequiredArgsConstructor
@Slf4j

public class ADVoucherController {

    private final ADVoucherService adVoucherService;
    private final ADVoucherDetailService adVoucherDetailService;
    @GetMapping
    public ResponseEntity<?> GetALlVouchers(ADVoucherSearchRequest request) {
        // Log để kiểm tra các tham số request gửi lên
        log.info("Request tìm kiếm voucher: {}", request);
        return ResponseEntity.ok(adVoucherService.getAllVoucher(request));
    }
    // 2. Lấy chi tiết một Voucher theo ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        log.info("Truy vấn chi tiết voucher ID: {}", id);
        return ResponseEntity.ok(adVoucherService.getByVoucher(id));
    }

    // 3. Thêm mới Voucher
    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody PostOrPutVoucherDto dto) {
        log.info("Hành động: Thêm mới Voucher - Data: {}", dto);
        return ResponseEntity.ok(adVoucherService.createOrUpdate(null, dto));
    }

    // 4. C ập nhật Voucher theo ID
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id,@Valid @RequestBody PostOrPutVoucherDto dto) {
        log.info("Hành động: Cập nhật Voucher ID: {} - Data: {}", id, dto);
        return ResponseEntity.ok(adVoucherService.createOrUpdate(id, dto));
    }
    @PatchMapping("/{id}/stop")
    public ResponseEntity<?> stopVoucher(@PathVariable("id") String id) {
        try {
            adVoucherService.stopVoucher(id);
            return ResponseEntity.ok("Đã buộc dừng voucher thành công");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi: " + e.getMessage());
        }
    }
    // Trong ADVoucherController.java
    @GetMapping("/check-code/{code}")
    public ResponseEntity<Boolean> checkCode(@PathVariable String code) {
        // Gọi trực tiếp hàm boolean từ service
        boolean exists = adVoucherService.isCodeExists(code);
        return ResponseEntity.ok(exists);
    }
    // Endpoint: PATCH /api/admin/vouchers/detail/{id}/status
    @PatchMapping("/detail/{id}/status")
    public ResponseEntity<?> updateDetailStatus(
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {

        try {
            Integer status = (Integer) body.get("status");
            String reason = (String) body.get("reason");

            adVoucherDetailService.updateStatus(id, status, reason);

            return ResponseEntity.ok(ResponseObject.success(null, "Cập nhật trạng thái thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponseObject.error(HttpStatus.BAD_REQUEST, e.getMessage()));
        }
    }
}
