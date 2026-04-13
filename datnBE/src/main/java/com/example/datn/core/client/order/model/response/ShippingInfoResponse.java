package com.example.datn.core.client.order.model.response;

import com.example.datn.infrastructure.constant.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingInfoResponse {
    private String orderId;
    private String orderCode;
    private OrderStatus orderStatus;
    private boolean shippingLocked;
    private String recipientName;
    private String recipientPhone;
    private String recipientAddress;
    private List<OrderChangeRequestResponse> pendingChangeRequests;
}
