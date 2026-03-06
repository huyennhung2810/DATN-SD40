package com.example.datn.core.admin.pos.service;

import com.example.datn.core.common.base.ResponseObject;

public interface ADPosOrderService {
    ResponseObject<?> createEmptyOrder();

    ResponseObject<?> addSerialToOrder(String orderId, String serialNumber);

    ResponseObject<?> getPendingOrders();

    ResponseObject<?> getOrderDetails(String orderId);

    ResponseObject<?> removeSerialFromOrder(String orderId, String serialNumber);

    ResponseObject<?> setCustomerForOrder(String orderId, String customerId);

    ResponseObject<?> checkoutOrder(String orderId);
}
