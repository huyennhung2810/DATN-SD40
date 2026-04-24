package com.example.datn.core.client.voucher.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailableCouponResponse {

    private String id;
    private String code;
    private String name;
    private String voucherType;
    private String discountUnit;
    private BigDecimal discountValue;
    private BigDecimal maxDiscountAmount;
    private BigDecimal conditions;
    private Long startDate;
    private Long endDate;
    private String note;
    private Integer quantity;
    private Integer status;

    private BigDecimal calculatedDiscount;
}
