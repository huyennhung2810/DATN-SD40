package com.example.datn.core.client.order.controller;

import com.example.datn.core.client.order.model.request.CheckoutRequest;
import com.example.datn.core.client.order.model.response.CheckoutResponse;
import com.example.datn.core.client.order.service.CnOrderService;
import com.example.datn.infrastructure.security.user.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/client")
@RequiredArgsConstructor
public class CnOrderController {

    private final CnOrderService cnOrderService;

    /**
     * Đặt hàng và thanh toán.
     * Yêu cầu đăng nhập (bắt buộc có customerId).
     * - paymentMethod = "COD"   → Tạo đơn hàng, trả về SUCCESS
     * - paymentMethod = "VNPAY" → Tạo đơn hàng, trả về URL thanh toán VNPay
     */
    @PostMapping("/orders/checkout")
    public ResponseEntity<CheckoutResponse> checkout(
            @RequestBody CheckoutRequest request,
            HttpServletRequest httpRequest) {

        // Yêu cầu bắt buộc có customerId (đã đăng nhập)
        if (request.getCustomerId() == null || request.getCustomerId().isEmpty()) {
            throw new RuntimeException("Vui lòng đăng nhập để đặt hàng!");
        }

        CheckoutResponse response = cnOrderService.checkout(request, request.getCustomerId(), httpRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * VNPay callback (IPN / Return URL) - phải để PUBLIC, không yêu cầu đăng nhập.
     */
    @GetMapping("/payment/vnpay-return")
    public ResponseEntity<Map<String, Object>> vnpayReturn(
            @RequestParam Map<String, String> params) {
        Map<String, Object> result = new HashMap<>();
        try {
            cnOrderService.handleVNPayReturn(params);
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
