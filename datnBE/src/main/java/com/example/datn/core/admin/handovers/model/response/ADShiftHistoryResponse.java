package com.example.datn.core.admin.handovers.model.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ADShiftHistoryResponse {
    private String id;
    private String employeeName;
    private Long checkInTime;
    private Long checkOutTime;
    private BigDecimal initialCash;
    private BigDecimal totalCashSales;
    private BigDecimal cashWithdraw;
    private BigDecimal actualCashAtEnd;
    private BigDecimal differenceAmount;
    private String note;
    private String status; // OPEN, CLOSED, PENDING
}
