package com.example.datn.core.admin.handovers.model.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ADShiftHandoverCheckInRequest {
    private String scheduleId;
    private BigDecimal initialCash;//tiền đầu ca
    private String note;
}
