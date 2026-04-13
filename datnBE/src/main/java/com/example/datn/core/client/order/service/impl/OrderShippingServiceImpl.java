package com.example.datn.core.client.order.service.impl;

import com.example.datn.core.client.order.model.request.UpdateShippingInfoRequest;
import com.example.datn.core.client.order.model.response.*;
import com.example.datn.core.client.order.service.OrderShippingService;
import com.example.datn.entity.*;
import com.example.datn.infrastructure.constant.*;
import com.example.datn.repository.*;
import com.example.datn.utils.Helper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderShippingServiceImpl implements OrderShippingService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final OrderChangeRequestRepository changeRequestRepository;
    private final ShippingAuditLogRepository auditLogRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private static final String FIELD_ADDRESS = "recipientAddress";
    private static final String FIELD_PHONE = "recipientPhone";
    private static final String FIELD_RECEIVER = "recipientName";

    @Override
    @Transactional
    public UpdateShippingInfoResponse updateShippingInfo(String orderId, String customerId,
                                                         UpdateShippingInfoRequest request) {
        if (!request.hasAnyField()) {
            throw new IllegalArgumentException("Phải cung cấp ít nhất một trường để cập nhật");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng: " + orderId));

        // Xác thực khách hàng sở hữu đơn hàng
        validateOrderOwnership(order, customerId);

        OrderStatus currentStatus = order.getOrderStatus();

        // Kiểm tra đơn hàng không ở trạng thái terminal
        if (currentStatus.isLocked()) {
            throw new IllegalStateException(
                    "Không thể cập nhật đơn hàng ở trạng thái '" + currentStatus.getDisplayText() + "'");
        }

        // Chỉ cho phép khách tự sửa khi đơn ở trạng thái CHỜ XÁC NHẬN
        if (!currentStatus.allowCustomerSelfUpdate()) {
            return buildSuccessResponse(order, null, "Đơn hàng không ở trạng thái cho phép tự cập nhật.");
        }

        // Bước 1: Ghi nhận các thay đổi, phân loại thành trực tiếp hoặc change request
        List<ChangeRequest> directChanges = new ArrayList<>();
        List<ChangeRequest> pendingChanges = new ArrayList<>();

        collectChanges(order, request, directChanges, pendingChanges);

        if (directChanges.isEmpty() && pendingChanges.isEmpty()) {
            throw new IllegalArgumentException("Không có thay đổi nào cần cập nhật");
        }

        // Bước 2: Nếu có change request (trạng thái >= DANG_GIAO)
        if (!pendingChanges.isEmpty()) {
            if (!directChanges.isEmpty()) {
                throw new IllegalStateException(
                        "Đơn hàng đã bàn giao cho đơn vị vận chuyển. Vui lòng chờ admin duyệt yêu cầu thay đổi.");
            }
            return createChangeRequestsAndRespond(order, pendingChanges, customerId);
        }

        // Bước 3: Cập nhật trực tiếp (trạng thái < DANG_GIAO)
        applyDirectChanges(order, directChanges, customerId);
        orderRepository.save(order);

        return buildDirectUpdateResponse(order, directChanges);
    }

    private void validateOrderOwnership(Order order, String customerId) {
        if (order.getCustomer() == null || !order.getCustomer().getId().equals(customerId)) {
            throw new SecurityException("Bạn không có quyền cập nhật đơn hàng này");
        }
    }

    private void collectChanges(Order order, UpdateShippingInfoRequest request,
                                 List<ChangeRequest> directChanges,
                                 List<ChangeRequest> pendingChanges) {
        ChangeRequest change;

        if (request.hasShippingAddress()
                && !Objects.equals(order.getRecipientAddress(), request.getShippingAddress())) {
            change = new ChangeRequest(FIELD_ADDRESS, order.getRecipientAddress(),
                    request.getShippingAddress(), ChangeRequestType.UPDATE_ADDRESS);
            (order.getOrderStatus().isShipped() ? pendingChanges : directChanges).add(change);
        }

        if (request.hasReceiverPhone()
                && !Objects.equals(order.getRecipientPhone(), request.getReceiverPhone())) {
            change = new ChangeRequest(FIELD_PHONE, order.getRecipientPhone(),
                    request.getReceiverPhone(), ChangeRequestType.UPDATE_PHONE);
            (order.getOrderStatus().isShipped() ? pendingChanges : directChanges).add(change);
        }

        if (request.hasReceiverName()
                && !Objects.equals(order.getRecipientName(), request.getReceiverName())) {
            change = new ChangeRequest(FIELD_RECEIVER, order.getRecipientName(),
                    request.getReceiverName(), ChangeRequestType.UPDATE_RECEIVER);
            (order.getOrderStatus().isShipped() ? pendingChanges : directChanges).add(change);
        }
    }

    private UpdateShippingInfoResponse createChangeRequestsAndRespond(Order order,
                                                                       List<ChangeRequest> pendingChanges,
                                                                       String customerId) {
        List<OrderChangeRequest> savedRequests = new ArrayList<>();

        for (ChangeRequest cr : pendingChanges) {
            OrderChangeRequest entity = OrderChangeRequest.builder()
                    .order(order)
                    .type(cr.type)
                    .oldValue(cr.oldValue)
                    .newValue(cr.newValue)
                    .changeStatus(ChangeRequestStatus.CHO_XU_LY)
                    .build();
            savedRequests.add(changeRequestRepository.save(entity));

            // Ghi audit log
            saveAuditLog(order, cr.fieldName, cr.oldValue, cr.newValue,
                    "CHANGE_REQUEST_CREATED", customerId, false);
        }

        // Gửi thông báo WebSocket cho admin
        notifyAdminsNewChangeRequest(order, savedRequests);

        return UpdateShippingInfoResponse.builder()
                .orderId(order.getId())
                .orderCode(order.getCode())
                .orderStatus(order.getOrderStatus())
                .directUpdate(false)
                .message("Đơn hàng đã bàn giao cho đơn vị vận chuyển. Yêu cầu thay đổi đã được gửi, vui lòng chờ admin duyệt.")
                .shippingInfo(UpdateShippingInfoResponse.ShippingInfoInfo.builder()
                        .recipientName(order.getRecipientName())
                        .recipientPhone(order.getRecipientPhone())
                        .recipientAddress(order.getRecipientAddress())
                        .build())
                .build();
    }

    private void applyDirectChanges(Order order, List<ChangeRequest> directChanges, String customerId) {
        for (ChangeRequest cr : directChanges) {
            switch (cr.fieldName) {
                case FIELD_ADDRESS -> order.setRecipientAddress(cr.newValue);
                case FIELD_PHONE -> order.setRecipientPhone(cr.newValue);
                case FIELD_RECEIVER -> order.setRecipientName(cr.newValue);
            }
            saveAuditLog(order, cr.fieldName, cr.oldValue, cr.newValue,
                    "DIRECT_UPDATE", customerId, true);
        }
    }

    private UpdateShippingInfoResponse buildDirectUpdateResponse(Order order,
                                                                  List<ChangeRequest> directChanges) {
        StringBuilder msg = new StringBuilder("Cập nhật thông tin giao hàng thành công: ");
        msg.append(directChanges.stream()
                .map(cr -> cr.type.getDescription())
                .collect(Collectors.joining(", ")));

        return UpdateShippingInfoResponse.builder()
                .orderId(order.getId())
                .orderCode(order.getCode())
                .orderStatus(order.getOrderStatus())
                .directUpdate(true)
                .message(msg.toString())
                .shippingInfo(UpdateShippingInfoResponse.ShippingInfoInfo.builder()
                        .recipientName(order.getRecipientName())
                        .recipientPhone(order.getRecipientPhone())
                        .recipientAddress(order.getRecipientAddress())
                        .build())
                .build();
    }

    private void saveAuditLog(Order order, String fieldName, String oldValue,
                               String newValue, String changeType, String updatedBy,
                               boolean isDirect) {
        ShippingAuditLog auditLog = ShippingAuditLog.builder()
                .order(order)
                .fieldName(fieldName)
                .oldValue(oldValue)
                .newValue(newValue)
                .changeType(changeType)
                .updatedBy(updatedBy)
                .isDirectUpdate(isDirect)
                .build();
        auditLogRepository.save(auditLog);
        log.info("Audit log saved: order={}, field={}, old={}, new={}",
                order.getCode(), fieldName, oldValue, newValue);
    }

    private void notifyAdminsNewChangeRequest(Order order,
                                                List<OrderChangeRequest> requests) {
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "CHANGE_REQUEST");
            notification.put("title", "Yêu cầu thay đổi thông tin giao hàng");
            notification.put("message",
                    "Khách hàng yêu cầu thay đổi thông tin giao hàng cho đơn " + order.getCode());
            notification.put("orderId", order.getId());
            notification.put("orderCode", order.getCode());
            notification.put("requestCount", requests.size());
            notification.put("timestamp", System.currentTimeMillis());

            messagingTemplate.convertAndSend("/topic/admin/notifications", notification);
            log.info("Đã gửi thông báo WebSocket về change request cho admin: order={}",
                    order.getCode());
        } catch (Exception e) {
            log.warn("Không thể gửi thông báo WebSocket: {}", e.getMessage());
        }
    }

    @Override
    public ShippingInfoResponse getShippingInfo(String orderId, String customerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng: " + orderId));

        validateOrderOwnership(order, customerId);

        List<OrderChangeRequestResponse> pendingRequests = changeRequestRepository
                .findByOrderIdOrderByCreatedDateDesc(orderId)
                .stream()
                .filter(r -> r.getChangeStatus() == ChangeRequestStatus.CHO_XU_LY)
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ShippingInfoResponse.builder()
                .orderId(order.getId())
                .orderCode(order.getCode())
                .orderStatus(order.getOrderStatus())
                .shippingLocked(Boolean.TRUE.equals(order.getIsShippingLocked()))
                .recipientName(order.getRecipientName())
                .recipientPhone(order.getRecipientPhone())
                .recipientAddress(order.getRecipientAddress())
                .pendingChangeRequests(pendingRequests)
                .build();
    }

    @Override
    public List<OrderChangeRequestResponse> getChangeRequests(String orderId, String customerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng: " + orderId));

        validateOrderOwnership(order, customerId);

        return changeRequestRepository.findByOrderIdOrderByCreatedDateDesc(orderId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ShippingAuditLogResponse> getShippingAuditLog(String orderId, String customerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng: " + orderId));

        validateOrderOwnership(order, customerId);

        return auditLogRepository.findByOrderIdOrderByCreatedDateDesc(orderId)
                .stream()
                .map(log -> ShippingAuditLogResponse.builder()
                        .id(log.getId())
                        .orderId(orderId)
                        .fieldName(log.getFieldName())
                        .oldValue(log.getOldValue())
                        .newValue(log.getNewValue())
                        .changeType(log.getChangeType())
                        .updatedBy(log.getUpdatedBy())
                        .isDirectUpdate(log.getIsDirectUpdate())
                        .createdAt(log.getCreatedDate() != null
                                ? java.time.Instant.ofEpochMilli(log.getCreatedDate())
                                        .atZone(java.time.ZoneId.systemDefault()).toLocalDateTime() : null)
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void lockShippingInfo(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng: " + orderId));
        order.setIsShippingLocked(true);
        orderRepository.save(order);
        log.info("Đã khóa thông tin giao hàng cho đơn hàng: {}", order.getCode());
    }

    private OrderChangeRequestResponse mapToResponse(OrderChangeRequest entity) {
        return OrderChangeRequestResponse.builder()
                .id(entity.getId())
                .orderId(entity.getOrder().getId())
                .orderCode(entity.getOrder().getCode())
                .type(entity.getType())
                .fieldName(getFieldName(entity.getType()))
                .oldValue(entity.getOldValue())
                .newValue(entity.getNewValue())
                .status(entity.getChangeStatus())
                .adminNote(entity.getAdminNote())
                .handledByName(entity.getHandledBy() != null
                        ? entity.getHandledBy().getName() : null)
                .createdAt(entity.getCreatedDate() != null
                        ? java.time.Instant.ofEpochMilli(entity.getCreatedDate())
                                .atZone(java.time.ZoneId.systemDefault()).toLocalDateTime() : null)
                .handledAt(entity.getHandledAt() != null
                        ? java.time.Instant.ofEpochMilli(entity.getHandledAt())
                                .atZone(java.time.ZoneId.systemDefault()).toLocalDateTime() : null)
                .build();
    }

    private String getFieldName(ChangeRequestType type) {
        return switch (type) {
            case UPDATE_ADDRESS -> FIELD_ADDRESS;
            case UPDATE_PHONE -> FIELD_PHONE;
            case UPDATE_RECEIVER -> FIELD_RECEIVER;
        };
    }

    private static class ChangeRequest {
        final String fieldName;
        final String oldValue;
        final String newValue;
        final ChangeRequestType type;

        ChangeRequest(String fieldName, String oldValue, String newValue,
                       ChangeRequestType type) {
            this.fieldName = fieldName;
            this.oldValue = oldValue;
            this.newValue = newValue;
            this.type = type;
        }
    }
}
