package com.example.datn.core.client.order.service;

import com.example.datn.core.client.order.model.request.UpdateShippingInfoRequest;
import com.example.datn.core.client.order.model.response.*;

import java.util.List;

public interface OrderShippingService {

    /**
     * Cập nhật thông tin giao hàng.
     * - Nếu trạng thái < DANG_GIAO: cập nhật trực tiếp
     * - Nếu trạng thái >= DANG_GIAO: tạo yêu cầu thay đổi (change request)
     */
    UpdateShippingInfoResponse updateShippingInfo(String orderId, String customerId,
                                                   UpdateShippingInfoRequest request);

    /**
     * Lấy thông tin giao hàng hiện tại của đơn hàng.
     */
    ShippingInfoResponse getShippingInfo(String orderId, String customerId);

    /**
     * Lấy danh sách yêu cầu thay đổi của đơn hàng.
     */
    List<OrderChangeRequestResponse> getChangeRequests(String orderId, String customerId);

    /**
     * Lấy lịch sử thay đổi thông tin giao hàng (audit log).
     */
    List<ShippingAuditLogResponse> getShippingAuditLog(String orderId, String customerId);

    /**
     * Khóa thông tin giao hàng khi đơn được bàn giao cho đơn vị vận chuyển.
     */
    void lockShippingInfo(String orderId);
}
