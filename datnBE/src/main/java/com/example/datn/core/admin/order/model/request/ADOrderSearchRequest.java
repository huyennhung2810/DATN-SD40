package com.example.datn.core.admin.order.model.request;


import com.example.datn.core.common.base.PageableRequest;
import com.example.datn.infrastructure.constant.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ADOrderSearchRequest extends PageableRequest {

    private String q;
    private String idSP;
    private Long startDate;
    private Long endDate;
    private OrderStatus status;
}
