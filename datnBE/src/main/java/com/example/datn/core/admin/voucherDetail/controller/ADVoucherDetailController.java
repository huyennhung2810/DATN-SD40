package com.example.datn.core.admin.voucherDetail.controller;

import com.example.datn.core.admin.voucherDetail.model.request.VoucherDetailRequest;
import com.example.datn.core.admin.voucherDetail.service.ADVoucherDetailService;
import com.example.datn.core.common.base.PageableRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/voucher-details")
@RequiredArgsConstructor
@Slf4j
public class ADVoucherDetailController {
    private final ADVoucherDetailService adVoucherDetailService;

    // Lấy danh sách khách hàng đang sở hữu voucher này
    @GetMapping("/voucher/{voucherId}")
    public ResponseEntity<?> getByVoucher(@PathVariable String voucherId, PageableRequest request) {
        return ResponseEntity.ok(adVoucherDetailService.getAllByVoucher(voucherId, request));
    }

    // API phát voucher cho khách hàng
    @PostMapping("/assign")
    public ResponseEntity<?> assign(@Valid @RequestBody VoucherDetailRequest request) {
        return ResponseEntity.ok(adVoucherDetailService.assignVoucherToCustomer(request));
    }
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String id,
            @RequestParam String newStatus) {
        log.info("Cập nhật trạng thái VoucherDetail ID: {} sang {}", id, newStatus);
        return ResponseEntity.ok(adVoucherDetailService.updateUsageStatus(id, newStatus));
    }
}
