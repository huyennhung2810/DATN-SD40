package com.example.datn.core.client.order.model.response;

import com.example.datn.infrastructure.constant.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateShippingInfoResponse {
    private String orderId;
    private String orderCode;
    private OrderStatus orderStatus;
    private boolean directUpdate;
    private String message;

    private ShippingInfoInfo shippingInfo;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShippingInfoInfo {
        private String recipientName;
        private String recipientPhone;
        private String recipientAddress;
    }
}
