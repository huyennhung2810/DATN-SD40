package com.example.datn.core.client.orderPublic.response;

import java.math.BigDecimal;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderTrackingResponse {
    private String id;
    private String code;
    private String status;
    private Long createdDate;
    private BigDecimal totalAmount;
    private String recipientName;
    private String recipientPhone;
    private String recipientAddress;
    private String paymentMethod;
    private String paymentStatus;
    private List<OrderDetailItem> orderDetails;

    @Data
    @Builder
    public static class OrderDetailItem {
        private String id;
        private String productName;
        private String variantName;
        private String imageUrl;
        private Integer quantity;
        private BigDecimal originalPrice;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }
}
