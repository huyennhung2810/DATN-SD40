package com.example.datn.core.admin.handovers.model.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ADShiftHandoverStatsResponse {

    private String handoverId;
    private String scheduleId;
    private BigDecimal initialCash; // tiền đầu ca
    private BigDecimal totalCashSales; // doanh thu tiền mặt
    private BigDecimal totalBankSales; // doanh thu chuyển khoản

}
