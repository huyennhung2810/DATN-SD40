package com.example.datn.core.client.order.service;

import com.example.datn.core.client.order.model.response.CustomerOrderDetailResponse;
import com.example.datn.core.client.order.model.response.CustomerOrderListResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;

public interface CnCustomerOrderService {

    Page<CustomerOrderListResponse> getOrderList(String customerId, String status, Pageable pageable);

    CustomerOrderDetailResponse getOrderDetail(String customerId, String orderId);

    Map<String, Object> cancelOrder(String customerId, String orderId, String reason);

    Map<String, Object> confirmReceived(String customerId, String orderId);

    Map<String, Object> buyAgain(String customerId, String orderId);
}
