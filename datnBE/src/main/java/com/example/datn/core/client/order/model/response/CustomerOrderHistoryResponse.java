package com.example.datn.core.client.order.model.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerOrderHistoryResponse {

    String id;
    String status;                // OrderStatus enum name
    String statusLabel;           // Vietnamese label
    LocalDateTime timestamp;     // When this status was set
    String note;                  // Note from admin/staff if any
    String performedBy;            // "Nhân viên: [name]" or "Khách hàng" or "Hệ thống"
    Boolean isCompleted;          // True for past/completed steps
    Boolean isCurrent;            // True for the most recent step
}
