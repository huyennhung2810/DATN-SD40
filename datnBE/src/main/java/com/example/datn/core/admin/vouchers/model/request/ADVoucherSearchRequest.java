package com.example.datn.core.admin.vouchers.model.request;
import com.example.datn.core.common.base.PageableRequest;
import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.Data;

@Data
public class ADVoucherSearchRequest extends PageableRequest {
    private String keyword;
    private String status;
    private String voucherType;
    private Long startDate;
    private Long endDate;
}
