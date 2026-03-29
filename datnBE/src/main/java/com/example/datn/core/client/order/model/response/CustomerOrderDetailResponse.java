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

    // === ORDER TYPE ===
    String orderType; // OFFLINE | ONLINE | GIAO_HANG

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
    /** Tổng giá niêm yết (trước KM sản phẩm) = totalAmount + campaignDiscount */
    BigDecimal originalSubtotal;
    /** Tạm tính sau KM sản phẩm, trước voucher (khớp Order.totalAmount) */
    BigDecimal totalAmount;
    /** Tổng tiền giảm từ đợt khuyến mãi (tổng OrderDetail.discountAmount) */
    BigDecimal campaignDiscount;
    /** Giảm từ voucher = totalAmount - totalAfterDiscount */
    BigDecimal voucherDiscount;
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
