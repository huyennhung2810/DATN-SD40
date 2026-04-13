package com.example.datn.core.client.order.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CheckoutResponse {
    private String orderId;
    private String orderCode;
    private BigDecimal totalAmount;
    /** Trạng thái: SUCCESS (COD) hoặc REDIRECT (VNPay) */
    private String status;
    /** URL thanh toán VNPay (chỉ có khi paymentMethod = VNPAY) */
    private String paymentUrl;
    private String message;
}
