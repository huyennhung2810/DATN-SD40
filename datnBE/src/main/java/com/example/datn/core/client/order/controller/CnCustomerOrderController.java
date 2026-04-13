package com.example.datn.core.client.order.controller;

import com.example.datn.core.client.order.model.response.CustomerOrderDetailResponse;
import com.example.datn.core.client.order.model.response.CustomerOrderListResponse;
import com.example.datn.core.client.order.service.CnCustomerOrderService;
import com.example.datn.core.common.base.ResponseObject;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/client/orders")
@RequiredArgsConstructor
public class CnCustomerOrderController {

    private final CnCustomerOrderService customerOrderService;

    /**
     * Lấy danh sách đơn hàng của khách hàng hiện tại.
     * Filter theo trạng thái nếu có.
     */
    @GetMapping
    public ResponseEntity<ResponseObject<Page<CustomerOrderListResponse>>> getOrderList(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size,
            @RequestParam(required = false) String q) {

        String customerId = getCurrentCustomerId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdDate"));

        Page<CustomerOrderListResponse> orders = customerOrderService.getOrderList(customerId, status, q, pageable);

        return ResponseEntity.ok(ResponseObject.success(orders, "Lấy danh sách đơn hàng thành công"));
    }

    /**
     * Lấy chi tiết một đơn hàng cụ thể.
     * Chỉ khách hàng sở hữu mới được xem.
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<ResponseObject<CustomerOrderDetailResponse>> getOrderDetail(
            @PathVariable String orderId) {

        String customerId = getCurrentCustomerId();
        CustomerOrderDetailResponse detail = customerOrderService.getOrderDetail(customerId, orderId);

        return ResponseEntity.ok(ResponseObject.success(detail, "Lấy chi tiết đơn hàng thành công"));
    }

    /**
     * Hủy đơn hàng.
     * Chỉ cho phép hủy khi đơn ở trạng thái CHO_XAC_NHAN hoặc DA_XAC_NHAN.
     */
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<ResponseObject<Map<String, Object>>> cancelOrder(
            @PathVariable String orderId,
            @RequestBody(required = false) Map<String, String> body) {

        String customerId = getCurrentCustomerId();
        String reason = body != null ? body.get("reason") : null;

        Map<String, Object> result = customerOrderService.cancelOrder(customerId, orderId, reason);

        return ResponseEntity.ok(ResponseObject.success(result, "Đơn hàng đã được hủy thành công"));
    }

    /**
     * Xác nhận đã nhận hàng.
     * Chỉ cho phép khi đơn ở trạng thái DANG_GIAO.
     */
    @PostMapping("/{orderId}/confirm-received")
    public ResponseEntity<ResponseObject<Map<String, Object>>> confirmReceived(
            @PathVariable String orderId) {

        String customerId = getCurrentCustomerId();
        Map<String, Object> result = customerOrderService.confirmReceived(customerId, orderId);

        return ResponseEntity.ok(ResponseObject.success(result, "Xác nhận đã nhận hàng thành công"));
    }

    /**
     * Mua lại - thêm sản phẩm từ đơn đã hoàn thành vào giỏ hàng.
     * Chỉ cho phép khi đơn ở trạng thái HOAN_THANH.
     */
    @PostMapping("/{orderId}/buy-again")
    public ResponseEntity<ResponseObject<Map<String, Object>>> buyAgain(
            @PathVariable String orderId) {

        String customerId = getCurrentCustomerId();
        Map<String, Object> result = customerOrderService.buyAgain(customerId, orderId);

        return ResponseEntity.ok(ResponseObject.success(result, "Mua lại thành công"));
    }

    private String getCurrentCustomerId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new RuntimeException("Người dùng chưa đăng nhập");
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof com.example.datn.infrastructure.security.user.UserPrincipal up) {
            return up.getId();
        }
        throw new RuntimeException("Không xác định được danh tính người dùng");
    }
}
