package com.example.datn.core.admin.pos.controller;

import com.example.datn.core.admin.pos.model.request.CheckoutPosRequest;
import com.example.datn.core.admin.pos.service.ADPosOrderService;
import com.example.datn.core.common.base.ResponseObject;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/pos/orders")
@RequiredArgsConstructor
public class POSOrderController {

    private final ADPosOrderService posOrderService;

    @PostMapping
    public ResponseEntity<?> createEmptyOrder() {
        return ResponseEntity.ok(posOrderService.createEmptyOrder());
    }

    @PostMapping("/{orderId}/add-product")
    public ResponseEntity<?> addProductToOrder(@PathVariable String orderId,
            @RequestParam String productDetailId, @RequestParam(defaultValue = "1") int quantity) {
        return ResponseEntity.ok(posOrderService.addProductToOrder(orderId, productDetailId, quantity));
    }

    @PostMapping("/{orderId}/details/{detailId}/assign-serials")
    public ResponseEntity<?> assignSerialsToOrderDetail(@PathVariable String orderId,
            @PathVariable String detailId,
            @RequestBody List<String> serialNumbers) {
        return ResponseEntity.ok(posOrderService.assignSerialsToOrderDetail(orderId, detailId, serialNumbers));
    }

    @GetMapping
    public ResponseEntity<?> getPendingOrders() {
        return ResponseEntity.ok(posOrderService.getPendingOrders());
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderDetails(@PathVariable String orderId) {
        return ResponseEntity.ok(posOrderService.getOrderDetails(orderId));
    }

    @DeleteMapping("/{orderId}/details/{detailId}/remove-product")
    public ResponseEntity<?> removeProductFromOrder(@PathVariable String orderId,
            @PathVariable String detailId) {
        return ResponseEntity.ok(posOrderService.removeProductFromOrder(orderId, detailId));
    }

    @DeleteMapping("/{orderId}/details/{detailId}/remove-serial")
    public ResponseEntity<?> removeSerialFromOrderDetail(@PathVariable String orderId,
            @PathVariable String detailId,
            @RequestParam String serialNumber) {
        return ResponseEntity.ok(posOrderService.removeSerialFromOrderDetail(orderId, detailId, serialNumber));
    }

    @PutMapping("/{orderId}/customer")
    public ResponseEntity<?> setCustomerForOrder(@PathVariable String orderId,
            @RequestParam String customerId) {
        return ResponseEntity.ok(posOrderService.setCustomerForOrder(orderId, customerId));
    }

    @PostMapping("/{orderId}/checkout")
    public ResponseEntity<?> checkoutOrder(@PathVariable String orderId,
            @RequestBody(required = false) CheckoutPosRequest request) {
        return ResponseEntity.ok(posOrderService.checkoutOrder(orderId, request));
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<?> cancelOrder(@PathVariable String orderId) {
        return ResponseEntity.ok(posOrderService.cancelOrder(orderId));
    }

    @GetMapping("/available-serials")
    public ResponseEntity<?> getAvailableSerials(@RequestParam String productDetailId) {
        return ResponseEntity.ok(posOrderService.getAvailableSerials(productDetailId));
    }

    @GetMapping("/applicable-vouchers")
    public ResponseEntity<?> getApplicableVouchers(@RequestParam java.math.BigDecimal orderTotal) {
        return ResponseEntity.ok(posOrderService.getApplicableVouchers(orderTotal));
    }

    @PostMapping("/{orderId}/apply-voucher")
    public ResponseEntity<?> applyVoucher(@PathVariable String orderId, @RequestParam String voucherId) {
        return ResponseEntity.ok(posOrderService.applyVoucher(orderId, voucherId));
    }

    @DeleteMapping("/{orderId}/remove-voucher")
    public ResponseEntity<?> removeVoucher(@PathVariable String orderId) {
        return ResponseEntity.ok(posOrderService.removeVoucher(orderId));
    }

    @PostMapping("/{orderId}/vnpay-url")
    public ResponseEntity<?> createVnPayUrl(@PathVariable String orderId,
            @RequestBody(required = false) CheckoutPosRequest body,
            HttpServletRequest request) {
        return ResponseEntity.ok(posOrderService.createVnPayUrl(orderId, body, request));
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<Map<String, Object>> posVnPayReturn(@RequestParam Map<String, String> params) {
        Map<String, Object> result = new HashMap<>();
        try {
            posOrderService.handlePosVnPayReturn(params);
            String responseCode = params.get("vnp_ResponseCode");
            result.put("success", "00".equals(responseCode));
            result.put("responseCode", responseCode);
            result.put("orderId", params.get("vnp_TxnRef"));
            result.put("transactionNo", params.get("vnp_TransactionNo"));
            result.put("amount", params.get("vnp_Amount"));
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", e.getMessage());
        }
        return ResponseEntity.ok(result);
    }
}
