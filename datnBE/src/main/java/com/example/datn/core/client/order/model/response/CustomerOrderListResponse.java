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
public class CustomerOrderListResponse {

    String id;
    String code;                  // Human-readable order code
    Long createdDate;             // Epoch millis — order creation time
    String orderStatus;           // OrderStatus enum name
    String orderStatusLabel;      // Vietnamese display label
    String paymentStatus;          // PaymentStatus enum name
    String paymentStatusLabel;    // Vietnamese display label
    String paymentMethod;          // COD / VNPAY / TIEN_MAT / CHUYEN_KHOAN
    String paymentMethodLabel;     // Vietnamese display label
    BigDecimal totalAmount;        // Sau KM sản phẩm, trước voucher (Order.totalAmount)
    BigDecimal totalAfterDiscount; // Số tiền sau voucher (Order.totalAfterDiscount)
    BigDecimal shippingFee;
    BigDecimal campaignDiscount;   // Tổng OrderDetail.discountAmount
    BigDecimal voucherDiscount;    // totalAmount - totalAfterDiscount
    String voucherCode;           // Voucher code if applied
    Integer itemCount;            // Total quantity of items
    List<OrderItemPreview> itemPreviews; // First 2-3 items for thumbnail preview

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class OrderItemPreview {
        String productName;
        String productImage;
        String variantLabel;      // "Body Only / Đen / 128GB"
        Integer quantity;
    }
}
