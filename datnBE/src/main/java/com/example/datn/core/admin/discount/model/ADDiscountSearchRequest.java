package com.example.datn.core.admin.discount.model;

import com.example.datn.core.common.base.PageableRequest;
import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.Data;

@Data
public class ADDiscountSearchRequest extends PageableRequest {
    private String keyword;
    private Integer status;
    private Long startDate;
    private Long endDate;
}
