package com.example.datn.core.client.order.controller;

import com.example.datn.core.client.order.model.request.UpdateShippingInfoRequest;
import com.example.datn.core.client.order.model.response.*;
import com.example.datn.core.client.order.service.OrderShippingService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.security.user.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/client/orders")
@RequiredArgsConstructor
public class CnOrderShippingController {

    private final OrderShippingService orderShippingService;

    /**
     * Cập nhật thông tin giao hàng.
     * - Trạng thái < DANG_GIAO: cập nhật trực tiếp
     * - Trạng thái >= DANG_GIAO: tạo yêu cầu thay đổi
     */
    @PatchMapping("/{orderId}/shipping-info")
    public ResponseEntity<ResponseObject<UpdateShippingInfoResponse>> updateShippingInfo(
            @PathVariable String orderId,
            @Valid @RequestBody UpdateShippingInfoRequest request) {
        String customerId = getCurrentCustomerId();
        UpdateShippingInfoResponse response = orderShippingService.updateShippingInfo(
                orderId, customerId, request);
        return ResponseEntity.ok(ResponseObject.success(response, "Cập nhật thông tin giao hàng thành công"));
    }

    /**
     * Lấy thông tin giao hàng hiện tại của đơn hàng.
     */
    @GetMapping("/{orderId}/shipping-info")
    public ResponseEntity<ResponseObject<ShippingInfoResponse>> getShippingInfo(
            @PathVariable String orderId) {
        String customerId = getCurrentCustomerId();
        ShippingInfoResponse response = orderShippingService.getShippingInfo(orderId, customerId);
        return ResponseEntity.ok(ResponseObject.success(response, "Lấy thông tin giao hàng thành công"));
    }

    /**
     * Lấy danh sách yêu cầu thay đổi của đơn hàng.
     */
    @GetMapping("/{orderId}/change-requests")
    public ResponseEntity<ResponseObject<List<OrderChangeRequestResponse>>> getChangeRequests(
            @PathVariable String orderId) {
        String customerId = getCurrentCustomerId();
        List<OrderChangeRequestResponse> requests = orderShippingService.getChangeRequests(
                orderId, customerId);
        return ResponseEntity.ok(ResponseObject.success(requests, "Lấy danh sách yêu cầu thay đổi thành công"));
    }

    /**
     * Lấy lịch sử thay đổi thông tin giao hàng (audit log).
     */
    @GetMapping("/{orderId}/audit-log")
    public ResponseEntity<ResponseObject<List<ShippingAuditLogResponse>>> getAuditLog(
            @PathVariable String orderId) {
        String customerId = getCurrentCustomerId();
        List<ShippingAuditLogResponse> logs = orderShippingService.getShippingAuditLog(orderId, customerId);
        return ResponseEntity.ok(ResponseObject.success(logs, "Lấy lịch sử thay đổi thành công"));
    }

    private String getCurrentCustomerId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new NoSuchElementException("Người dùng chưa đăng nhập");
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof UserPrincipal up) {
            return up.getId();
        }
        throw new NoSuchElementException("Không xác định được danh tính người dùng");
    }
}
