package com.example.datn.core.admin.customer.model.request;

import com.example.datn.core.common.base.PageableRequest;
import com.example.datn.infrastructure.constant.EntityStatus;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = false)
@Data
public class ADCustomerSearchRequest extends PageableRequest {
    private String keyword;

    private Boolean gender;
    private EntityStatus status;
}
