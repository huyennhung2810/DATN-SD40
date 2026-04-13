package com.example.datn.core.admin.order.model.request;

import com.example.datn.core.common.base.PageableRequest;
import com.example.datn.infrastructure.constant.ChangeRequestStatus;
import com.example.datn.infrastructure.constant.ChangeRequestType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ADChangeRequestSearchRequest extends PageableRequest {
    private ChangeRequestStatus status;
    private String orderCode;
    private ChangeRequestType type;
}
