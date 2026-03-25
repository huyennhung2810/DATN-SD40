package com.example.datn.core.client.order.model.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerOrderDetailResponse {

    // === ORDER HEADER ===
    String id;
    String code;
    Long createdDate;
    Long paymentDate;

    // === STATUS ===
    String orderStatus;
    String orderStatusLabel;
    String paymentStatus;
    String paymentStatusLabel;
    String paymentMethod;
    String paymentMethodLabel;

    // === RECIPIENT ===
    String recipientName;
    String recipientPhone;
    String recipientEmail;
    String recipientAddress;
    String shippingMethodName;

    // === PRICING ===
    BigDecimal totalAmount;        // Subtotal before discounts
    BigDecimal campaignDiscount;   // Total discount from campaigns
    BigDecimal voucherDiscount;    // Discount from voucher
    String voucherCode;
    String voucherName;
    BigDecimal shippingFee;
    BigDecimal customerPaid;
    BigDecimal totalAfterDiscount; // Final amount

    // === NOTE ===
    String note;

    // === ITEMS ===
    List<CustomerOrderItemResponse> items;

    // === TIMELINE ===
    List<CustomerOrderHistoryResponse> timeline;

    // === ALLOWED ACTIONS ===
    Boolean canCancel;
    Boolean canConfirmReceived;
    Boolean canBuyAgain;
}
