package com.example.datn.core.admin.handovers.model.request;

import lombok.Data;

@Data
public class ADShiftHandoverProductAuditRequest {

    private String productId;
    private Integer actualQuantity;
    private String conditionNote; // "Trầy xước", "Mốc", "Ok"...
}
