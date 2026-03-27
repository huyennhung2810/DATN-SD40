package com.example.datn.core.client.order.model.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CheckoutRequest {
    private String customerId;
    private String recipientName;
    private String recipientPhone;
    private String recipientEmail;
    private String recipientAddress;
    /** COD hoặc VNPAY */
    private String paymentMethod;
    private String note;
    private String voucherCode;
    private Boolean isBuyNow;
    private List<ItemRequest> items;

    @Getter
    @Setter
    public static class ItemRequest {
        private String productDetailId;
        private Integer quantity;
    }
}
