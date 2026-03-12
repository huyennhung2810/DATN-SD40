package com.example.datn.core.admin.vouchers.model.response;

import com.example.datn.entity.Voucher;
import com.example.datn.entity.VoucherDetail;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class VoucherResponse {
    private String id;
    private String code;
    private String name;
    private String voucherType;
    private String discountUnit;
    private BigDecimal maxDiscountAmount;
    private BigDecimal conditions;
    private Long startDate;
    private Long endDate;
    private String note;
    private Integer quantity;
    private BigDecimal discountValue;
    private Integer status;
    private String lastModifiedBy;
    private Long lastModifiedDate;
    private List<VoucherDetail> details;

    public VoucherResponse(Voucher v) {
        this.id = v.getId();
        this.code = v.getCode();
        this.name = v.getName();
        this.voucherType = v.getVoucherType();
        this.discountUnit = v.getDiscountUnit();
        this.maxDiscountAmount = v.getMaxDiscountAmount();
        this.conditions = v.getConditions();
        this.startDate = v.getStartDate();
        this.endDate = v.getEndDate();
        this.note = v.getNote();
        this.quantity = v.getQuantity();
        this.discountValue = v.getDiscountValue();
        this.status = v.getStatus();
        this.lastModifiedBy = v.getLastModifiedBy();
        this.lastModifiedDate = v.getLastModifiedDate();
        this.details = v.getDetails();
    }
}
