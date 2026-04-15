package com.example.datn.core.client.orderPublic.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.datn.core.client.orderPublic.response.OrderTrackingResponse;
import com.example.datn.entity.Order;
import com.example.datn.entity.OrderDetail;
import com.example.datn.repository.OrderDetailRepository;
import com.example.datn.repository.OrderRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/public/orders")
@RequiredArgsConstructor
public class CnPublicOrderController {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;

    @GetMapping("/track")
    public ResponseEntity<?> trackOrder(
            @RequestParam String orderCode,
            @RequestParam String contactInfo) {

        // 1. Tìm đơn hàng
        Order order = orderRepository.findByCode(orderCode.trim().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + orderCode));

        // 2. Xác thực SĐT / Email
        boolean isMatchPhone = contactInfo.trim().equals(order.getRecipientPhone());
        boolean isMatchEmail = contactInfo.trim().equalsIgnoreCase(order.getRecipientEmail());

        if (!isMatchPhone && !isMatchEmail) {
            throw new RuntimeException("Thông tin liên hệ (SĐT/Email) không khớp với đơn hàng này!");
        }

        // 3. Lấy chi tiết & Build Response
        List<OrderDetail> orderDetails = orderDetailRepository.findByOrderId(order.getId());
        List<OrderTrackingResponse.OrderDetailItem> detailItems = orderDetails.stream().map(od -> {
            String variantName = od.getProductDetail().getColor() != null ? od.getProductDetail().getColor().getName()
                    : "";
            if (od.getProductDetail().getStorageCapacity() != null) {
                variantName += " " + od.getProductDetail().getStorageCapacity().getName();
            }

            String imageUrl = od.getProductDetail().getImageUrl();
            if (imageUrl == null && !od.getProductDetail().getProduct().getImages().isEmpty()) {
                imageUrl = od.getProductDetail().getProduct().getImages().get(0).getUrl();
            }

            return OrderTrackingResponse.OrderDetailItem.builder()
                    .id(od.getId())
                    .productName(od.getProductDetail().getProduct().getName())
                    .variantName(variantName.trim())
                    .imageUrl(imageUrl)
                    .quantity(od.getQuantity())
                    .unitPrice(od.getUnitPrice())
                    .totalPrice(od.getTotalPrice())
                    .build();
        }).collect(Collectors.toList());

        OrderTrackingResponse response = OrderTrackingResponse.builder()
                .id(order.getId())
                .code(order.getCode())
                .status(order.getOrderStatus() != null ? order.getOrderStatus().name() : "CHO_XAC_NHAN")
                .createdDate(order.getCreatedDate() != null ? order.getCreatedDate() : System.currentTimeMillis())
                .totalAmount(order.getTotalAmount())
                .recipientName(order.getRecipientName())
                .recipientPhone(order.getRecipientPhone())
                .recipientAddress(order.getRecipientAddress())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : "CHUA_THANH_TOAN")
                .orderDetails(detailItems)
                .build();

        return ResponseEntity.ok(response);
    }
}