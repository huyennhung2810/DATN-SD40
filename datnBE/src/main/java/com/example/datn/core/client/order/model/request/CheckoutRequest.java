package com.example.datn.core.client.order.model.request;

import lombok.Getter;
import lombok.Setter;

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
}
