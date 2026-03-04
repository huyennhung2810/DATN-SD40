
package com.example.datn.core.admin.handovers.model.request;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ADShiftHandoverCheckOutRequest {
    private String scheduleId;

    // Tiền
    private BigDecimal actualCash;   // Tiền thực tế đếm được
    private BigDecimal withdrawAmount; // Tiền chi tiêu trong ca (nếu có)

    // Ghi chú
    private String note;
}
