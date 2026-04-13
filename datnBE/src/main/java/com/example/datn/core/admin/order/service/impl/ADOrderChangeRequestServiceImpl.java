package com.example.datn.core.admin.order.service.impl;

import com.example.datn.core.admin.order.model.request.ADChangeRequestSearchRequest;
import com.example.datn.core.admin.order.model.request.ChangeRequestActionRequest;
import com.example.datn.core.admin.order.model.response.ADChangeRequestResponse;
import com.example.datn.core.admin.order.repository.ADOrderChangeRequestRepository;
import com.example.datn.core.admin.order.repository.ADOrderRepository;
import com.example.datn.core.admin.order.service.ADOrderChangeRequestService;
import com.example.datn.core.client.order.service.OrderShippingService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.*;
import com.example.datn.infrastructure.constant.*;
import com.example.datn.repository.*;
import com.example.datn.utils.Helper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Slf4j
public class ADOrderChangeRequestServiceImpl implements ADOrderChangeRequestService {

    private final ADOrderChangeRequestRepository changeRequestRepository;
    private final ADOrderRepository orderRepository;
    private final EmployeeRepository employeeRepository;
    private final ShippingAuditLogRepository auditLogRepository;
    private final OrderShippingService orderShippingService;
    private final SimpMessagingTemplate messagingTemplate;

    private static final String FIELD_ADDRESS = "recipientAddress";
    private static final String FIELD_PHONE = "recipientPhone";
    private static final String FIELD_RECEIVER = "recipientName";

    @Override
    public ResponseObject<?> getAllChangeRequests(ADChangeRequestSearchRequest request) {
        try {
            Pageable pageable = Helper.createPageable(request, "createdDate");
            Page<OrderChangeRequest> page = changeRequestRepository
                    .searchChangeRequests(request.getStatus(), request.getOrderCode(),
                            request.getType(), pageable);

            Page<ADChangeRequestResponse> mapped = page.map(this::toDetailResponse);
            return ResponseObject.success(mapped, "Lấy danh sách yêu cầu thay đổi thành công");
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách yêu cầu thay đổi: {}", e.getMessage(), e);
            return ResponseObject.error(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "Lỗi khi lấy danh sách: " + e.getMessage());
        }
    }

    @Override
    public ResponseObject<?> getChangeRequestDetail(String id) {
        try {
            OrderChangeRequest request = changeRequestRepository.findById(id)
                    .orElseThrow(() -> new NoSuchElementException(
                            "Không tìm thấy yêu cầu thay đổi: " + id));

            return ResponseObject.success(toDetailResponse(request),
                    "Lấy chi tiết yêu cầu thay đổi thành công");
        } catch (NoSuchElementException e) {
            return ResponseObject.error(org.springframework.http.HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết yêu cầu thay đổi: {}", e.getMessage(), e);
            return ResponseObject.error(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "Lỗi hệ thống: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResponseObject<?> approveChangeRequest(String id, ChangeRequestActionRequest actionRequest) {
        try {
            OrderChangeRequest request = changeRequestRepository.findById(id)
                    .orElseThrow(() -> new NoSuchElementException(
                            "Không tìm thấy yêu cầu thay đổi: " + id));

            if (request.getChangeStatus() != ChangeRequestStatus.CHO_XU_LY) {
                return ResponseObject.error(org.springframework.http.HttpStatus.BAD_REQUEST,
                        "Yêu cầu này đã được xử lý trước đó");
            }

            Order order = request.getOrder();

            // Áp dụng thay đổi vào đơn hàng
            applyChangeToOrder(order, request);

            // Cập nhật trạng thái yêu cầu
            Employee currentEmployee = getCurrentEmployee();
            request.setChangeStatus(ChangeRequestStatus.DA_DUYET);
            request.setHandledBy(currentEmployee);
            request.setHandledAt(System.currentTimeMillis());
            if (actionRequest.getAdminNote() != null) {
                request.setAdminNote(actionRequest.getAdminNote());
            }
            changeRequestRepository.save(request);

            // Ghi audit log
            saveAdminAuditLog(order, request, currentEmployee);

            // Gửi thông báo cho khách hàng
            notifyCustomer(order, "Yêu cầu thay đổi đã được duyệt",
                    "Admin đã chấp nhận yêu cầu " + request.getType().getDescription());

            // Nếu là đơn hàng đang giao, gọi API cập nhật với đơn vị vận chuyển
            if (order.getOrderStatus() == OrderStatus.DANG_GIAO) {
                handleShippingApiUpdate(order);
            }

            log.info("Đã duyệt yêu cầu thay đổi {} cho đơn hàng {} bởi {}",
                    id, order.getCode(), currentEmployee.getName());

            return ResponseObject.success(toDetailResponse(request),
                    "Duyệt yêu cầu thay đổi thành công");

        } catch (NoSuchElementException e) {
            return ResponseObject.error(org.springframework.http.HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            log.error("Lỗi khi duyệt yêu cầu thay đổi: {}", e.getMessage(), e);
            return ResponseObject.error(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "Lỗi hệ thống: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResponseObject<?> rejectChangeRequest(String id, ChangeRequestActionRequest actionRequest) {
        try {
            if (actionRequest.getAdminNote() == null || actionRequest.getAdminNote().isBlank()) {
                return ResponseObject.error(org.springframework.http.HttpStatus.BAD_REQUEST,
                        "Vui lòng nhập lý do từ chối");
            }

            OrderChangeRequest request = changeRequestRepository.findById(id)
                    .orElseThrow(() -> new NoSuchElementException(
                            "Không tìm thấy yêu cầu thay đổi: " + id));

            if (request.getChangeStatus() != ChangeRequestStatus.CHO_XU_LY) {
                return ResponseObject.error(org.springframework.http.HttpStatus.BAD_REQUEST,
                        "Yêu cầu này đã được xử lý trước đó");
            }

            Employee currentEmployee = getCurrentEmployee();
            request.setChangeStatus(ChangeRequestStatus.TU_CHOI);
            request.setHandledBy(currentEmployee);
            request.setHandledAt(System.currentTimeMillis());
            request.setAdminNote(actionRequest.getAdminNote());
            changeRequestRepository.save(request);

            // Gửi thông báo cho khách hàng
            notifyCustomer(request.getOrder(), "Yêu cầu thay đổi bị từ chối",
                    "Lý do: " + actionRequest.getAdminNote());

            log.info("Đã từ chối yêu cầu thay đổi {} cho đơn hàng {} bởi {}: {}",
                    id, request.getOrder().getCode(), currentEmployee.getName(),
                    actionRequest.getAdminNote());

            return ResponseObject.success(toDetailResponse(request),
                    "Từ chối yêu cầu thay đổi thành công");

        } catch (NoSuchElementException e) {
            return ResponseObject.error(org.springframework.http.HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            log.error("Lỗi khi từ chối yêu cầu thay đổi: {}", e.getMessage(), e);
            return ResponseObject.error(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "Lỗi hệ thống: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResponseObject<?> cancelAndRecreateShipment(String orderId, String reason) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new NoSuchElementException(
                            "Không tìm thấy đơn hàng: " + orderId));

            if (order.getOrderStatus() != OrderStatus.DANG_GIAO) {
                return ResponseObject.error(org.springframework.http.HttpStatus.BAD_REQUEST,
                        "Chỉ có thể hủy và tạo lại vận đơn khi đơn đang ở trạng thái 'Đang giao hàng'");
            }

            // Mở khóa thông tin giao hàng
            order.setIsShippingLocked(false);

            // Tạo ghi chú về việc hủy vận đơn
            Employee currentEmployee = getCurrentEmployee();
            OrderHistory history = new OrderHistory();
            history.setOrder(order);
            history.setTrangThai(order.getOrderStatus());
            history.setNote("HỦY VẬN ĐƠN: " + (reason != null ? reason : "Yêu cầu từ admin")
                    + " - Bởi: " + currentEmployee.getName());
            history.setThoiGian(java.time.LocalDateTime.now());
            history.setNhanVien(currentEmployee);

            log.info("Đã hủy và mở khóa vận đơn cho đơn hàng {} bởi {}",
                    order.getCode(), currentEmployee.getName());

            Map<String, Object> result = new HashMap<>();
            result.put("orderId", order.getId());
            result.put("orderCode", order.getCode());
            result.put("message", "Đã hủy vận đơn. Thông tin giao hàng đã được mở khóa để cập nhật.");

            return ResponseObject.success(result,
                    "Hủy vận đơn và mở khóa thông tin giao hàng thành công");

        } catch (NoSuchElementException e) {
            return ResponseObject.error(org.springframework.http.HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            log.error("Lỗi khi hủy vận đơn: {}", e.getMessage(), e);
            return ResponseObject.error(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "Lỗi hệ thống: " + e.getMessage());
        }
    }

    private void applyChangeToOrder(Order order, OrderChangeRequest request) {
        switch (request.getType()) {
            case UPDATE_ADDRESS -> order.setRecipientAddress(request.getNewValue());
            case UPDATE_PHONE -> order.setRecipientPhone(request.getNewValue());
            case UPDATE_RECEIVER -> order.setRecipientName(request.getNewValue());
        }
        orderRepository.save(order);
        log.info("Đã áp dụng thay đổi {} cho đơn hàng {}: {} -> {}",
                request.getType(), order.getCode(), request.getOldValue(), request.getNewValue());
    }

    private void saveAdminAuditLog(Order order, OrderChangeRequest request, Employee employee) {
        ShippingAuditLog auditLog = ShippingAuditLog.builder()
                .order(order)
                .fieldName(getFieldName(request.getType()))
                .oldValue(request.getOldValue())
                .newValue(request.getNewValue())
                .changeType("ADMIN_APPROVED")
                .updatedBy(employee.getId())
                .isDirectUpdate(false)
                .build();
        auditLogRepository.save(auditLog);
    }

    private void notifyCustomer(Order order, String title, String message) {
        try {
            if (order.getCustomer() == null) return;

            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "CHANGERequest_RESULT");
            notification.put("title", title);
            notification.put("message", message);
            notification.put("orderId", order.getId());
            notification.put("orderCode", order.getCode());
            notification.put("timestamp", System.currentTimeMillis());

            messagingTemplate.convertAndSend(
                    "/topic/client/notifications/" + order.getCustomer().getId(),
                    notification);
        } catch (Exception e) {
            log.warn("Không thể gửi thông báo cho khách hàng: {}", e.getMessage());
        }
    }

    private void handleShippingApiUpdate(Order order) {
        // Integration interface - gọi API đơn vị vận chuyển để cập nhật thông tin
        // Chi tiết triển khai tùy thuộc vào shipping provider cụ thể (GHN, GHTK, VNPost...)
        log.info("Shipping API integration point: Gọi API cập nhật cho đơn hàng {} với shipping provider",
                order.getCode());
    }

    private Employee getCurrentEmployee() {
        Authentication authentication = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Không xác định được nhân viên thực hiện");
        }
        String username = authentication.getName();
        return employeeRepository.findByAccount_Username(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin nhân viên: " + username));
    }

    private ADChangeRequestResponse toDetailResponse(OrderChangeRequest entity) {
        Order order = entity.getOrder();
        return ADChangeRequestResponse.builder()
                .id(entity.getId())
                .orderId(order.getId())
                .orderCode(order.getCode())
                .customerName(order.getCustomer() != null ? order.getCustomer().getName() : null)
                .customerPhone(order.getRecipientPhone())
                .type(entity.getType())
                .fieldName(getFieldName(entity.getType()))
                .oldValue(entity.getOldValue())
                .newValue(entity.getNewValue())
                .status(entity.getChangeStatus())
                .adminNote(entity.getAdminNote())
                .handledByName(entity.getHandledBy() != null
                        ? entity.getHandledBy().getName() : null)
                .createdAt(entity.getCreatedDate() != null
                        ? Instant.ofEpochMilli(entity.getCreatedDate())
                                .atZone(ZoneId.systemDefault()).toLocalDateTime()
                        : null)
                .handledAt(entity.getHandledAt() != null
                        ? Instant.ofEpochMilli(entity.getHandledAt())
                                .atZone(ZoneId.systemDefault()).toLocalDateTime()
                        : null)
                .createdBy(order.getCustomer() != null
                        ? order.getCustomer().getId() : null)
                .build();
    }

    private String getFieldName(ChangeRequestType type) {
        return switch (type) {
            case UPDATE_ADDRESS -> FIELD_ADDRESS;
            case UPDATE_PHONE -> FIELD_PHONE;
            case UPDATE_RECEIVER -> FIELD_RECEIVER;
        };
    }
}
