package com.example.datn.core.admin.pos.service;

import com.example.datn.core.common.base.ResponseObject;

public interface ADPosOrderService {
    ResponseObject<?> createEmptyOrder();

    ResponseObject<?> addProductToOrder(String orderId, String productDetailId, int quantity);

    ResponseObject<?> assignSerialsToOrderDetail(String orderId, String detailId, java.util.List<String> serialNumbers);

    ResponseObject<?> getPendingOrders();

    ResponseObject<?> getOrderDetails(String orderId);

    ResponseObject<?> removeSerialFromOrderDetail(String orderId, String detailId, String serialNumber);

    ResponseObject<?> removeProductFromOrder(String orderId, String detailId);

    ResponseObject<?> setCustomerForOrder(String orderId, String customerId);

    ResponseObject<?> checkoutOrder(String orderId);

    ResponseObject<?> cancelOrder(String orderId);
}
