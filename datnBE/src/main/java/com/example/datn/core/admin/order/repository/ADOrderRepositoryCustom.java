package com.example.datn.core.admin.order.repository;

import com.example.datn.core.admin.order.model.request.ADOrderSearchRequest;
import com.example.datn.core.admin.order.model.response.OrderPageResponse;

import org.springframework.data.domain.Pageable;


public interface ADOrderRepositoryCustom {

    /**
     * @param onlineOrdersOnly true: chỉ {@link com.example.datn.infrastructure.constant.TypeInvoice#ONLINE} (module Đơn hàng online)
     */
    OrderPageResponse getAllHoaDonResponse(ADOrderSearchRequest request, Pageable pageable, boolean onlineOrdersOnly);
}