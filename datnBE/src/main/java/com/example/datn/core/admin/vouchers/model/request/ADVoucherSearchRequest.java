package com.example.datn.core.admin.vouchers.model.request;
import com.example.datn.core.common.base.PageableRequest;
import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class ADVoucherSearchRequest extends PageableRequest {
    private String keyword;
    private Integer status;
    private String voucherType;
    private Long startDate;
    private Long endDate;
}
