package com.example.datn.core.admin.order.controller;

import com.example.datn.core.admin.order.model.request.ADChangeRequestSearchRequest;
import com.example.datn.core.admin.order.model.request.ChangeRequestActionRequest;
import com.example.datn.core.admin.order.service.ADOrderChangeRequestService;
import com.example.datn.utils.Helper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/change-requests")
@RequiredArgsConstructor
public class ADOrderChangeRequestController {

    private final ADOrderChangeRequestService service;

    /**
     * Lấy danh sách yêu cầu thay đổi (có phân trang, lọc).
     */
    @GetMapping
    public ResponseEntity<?> getAll(@ModelAttribute ADChangeRequestSearchRequest request) {
        return Helper.createResponseEntity(service.getAllChangeRequests(request));
    }

    /**
     * Lấy chi tiết một yêu cầu thay đổi.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getDetail(@PathVariable String id) {
        return Helper.createResponseEntity(service.getChangeRequestDetail(id));
    }

    /**
     * Duyệt yêu cầu thay đổi.
     * Áp dụng thay đổi vào đơn hàng và gửi thông báo cho khách hàng.
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable String id,
                                    @RequestBody ChangeRequestActionRequest request) {
        return Helper.createResponseEntity(service.approveChangeRequest(id, request));
    }

    /**
     * Từ chối yêu cầu thay đổi.
     * Bắt buộc phải có adminNote (lý do từ chối).
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable String id,
                                    @RequestBody ChangeRequestActionRequest request) {
        return Helper.createResponseEntity(service.rejectChangeRequest(id, request));
    }

    /**
     * Hủy vận đơn hiện tại và mở khóa thông tin giao hàng để tạo vận đơn mới.
     */
    @PostMapping("/order/{orderId}/cancel-shipment")
    public ResponseEntity<?> cancelShipment(@PathVariable String orderId,
                                            @RequestBody(required = false) String reason) {
        return Helper.createResponseEntity(service.cancelAndRecreateShipment(orderId, reason));
    }
}
