package com.example.datn.core.admin.order.model.response;

import com.example.datn.infrastructure.constant.ChangeRequestStatus;
import com.example.datn.infrastructure.constant.ChangeRequestType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ADChangeRequestResponse {
    private String id;
    private String orderId;
    private String orderCode;
    private String customerName;
    private String customerPhone;
    private ChangeRequestType type;
    private String fieldName;
    private String oldValue;
    private String newValue;
    private ChangeRequestStatus status;
    private String adminNote;
    private String handledByName;
    private LocalDateTime createdAt;
    private LocalDateTime handledAt;
    private String createdBy;
}
