package com.example.datn.core.admin.order.service;

import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.OrderStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ADOrderService {

    ResponseObject<?> searchOrders(OrderStatus status, String keyword, Pageable pageable);

    ResponseObject<?> getOrderDetails(String orderId);

    ResponseObject<?> updateOrderStatus(String orderId, OrderStatus newStatus, String note);

    ResponseObject<?> assignSerialsToDetail(String orderId, String detailId, List<String> serialNumbers);
}
