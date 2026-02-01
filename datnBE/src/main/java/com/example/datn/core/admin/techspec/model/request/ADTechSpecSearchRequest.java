package com.example.datn.core.admin.techspec.model.request;

import com.example.datn.core.common.base.PageableRequest;
import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ADTechSpecSearchRequest extends PageableRequest {
    private String keyword;
    private EntityStatus status;
}