package com.example.datn.core.client.order.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingAuditLogResponse {
    private String id;
    private String orderId;
    private String fieldName;
    private String oldValue;
    private String newValue;
    private String changeType;
    private String updatedBy;
    private LocalDateTime createdAt;
    private Boolean isDirectUpdate;
}
