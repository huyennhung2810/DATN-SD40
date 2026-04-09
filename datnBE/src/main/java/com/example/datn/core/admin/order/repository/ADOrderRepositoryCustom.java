package com.example.datn.core.admin.order.repository;

import com.example.datn.core.admin.order.model.request.ADOrderSearchRequest;
import com.example.datn.core.admin.order.model.response.OrderPageResponse;

import org.springframework.data.domain.Pageable;

public interface ADOrderRepositoryCustom {
    OrderPageResponse getAllHoaDonResponse(ADOrderSearchRequest request, Pageable pageable);
}