package com.example.datn.core.admin.voucherDetail.controller;

import com.example.datn.core.admin.voucherDetail.model.request.VoucherDetailRequest;
import com.example.datn.core.admin.voucherDetail.service.ADVoucherDetailService;
import com.example.datn.core.common.base.PageableRequest;
import com.example.datn.core.common.base.ResponseObject;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/voucher-details")
@RequiredArgsConstructor
@Slf4j
public class ADVoucherDetailController {
    private final ADVoucherDetailService adVoucherDetailService;
    /**
     * Lấy danh sách khách hàng đã được áp dụng voucher (có phân trang)
     */
    @GetMapping("/{voucherId}")
    public ResponseEntity<?> getByVoucher(@PathVariable String voucherId, Pageable pageable) {
        return ResponseEntity.ok(adVoucherDetailService.findAllByVoucherId(voucherId, pageable));
    }

    /**
     * Vô hiệu hóa voucher của một khách hàng kèm lý do
     */
    @PatchMapping("/disable")
    public ResponseEntity<?> disableCustomerVoucher(@RequestBody Map<String, String> request) {
        try {
            String voucherId = request.get("voucherId");
            String customerId = request.get("customerId");
            String reason = request.get("reason");

            adVoucherDetailService.disableCustomerVoucher(voucherId, customerId, reason);
            return ResponseEntity.ok("Vô hiệu hóa thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Xóa khách hàng khỏi danh sách áp dụng (khi chưa gửi mail/chưa dùng)
     */
    @DeleteMapping("/{voucherId}/{customerId}")
    public ResponseEntity<?> removeCustomer(@PathVariable String voucherId, @PathVariable String customerId) {
        try {
            adVoucherDetailService.removeCustomerFromVoucher(voucherId, customerId);
            return ResponseEntity.ok("Đã xóa khách hàng khỏi danh sách");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


}
