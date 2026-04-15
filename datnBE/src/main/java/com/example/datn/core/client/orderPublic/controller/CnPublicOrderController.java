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

            // Xử lý nối tên phân loại (Màu sắc, Dung lượng)
            String variantName = "";
            if (od.getProductDetail().getColor() != null) {
                variantName += od.getProductDetail().getColor().getName();
            }
            if (od.getProductDetail().getStorageCapacity() != null) {
                variantName += " " + od.getProductDetail().getStorageCapacity().getName();
            }

            // XỬ LÝ ẢNH CHỐNG LỖI (Fix ở đây)
            String imageUrl = od.getProductDetail().getImageUrl();

            // Kiểm tra: Nếu imageUrl bị null HOẶC là chuỗi rỗng
            if (imageUrl == null || imageUrl.trim().isEmpty()) {
                // Lấy ảnh từ Product cha một cách an toàn
                if (od.getProductDetail().getProduct() != null &&
                        od.getProductDetail().getProduct().getImages() != null &&
                        !od.getProductDetail().getProduct().getImages().isEmpty()) {

                    imageUrl = od.getProductDetail().getProduct().getImages().get(0).getUrl();
                } else {
                    imageUrl = ""; // Nếu không có ảnh nào, trả về rỗng để FE dùng ảnh mặc định
                }
            }

            return OrderTrackingResponse.OrderDetailItem.builder()
                    .id(od.getId())
                    .productName(od.getProductDetail().getProduct().getName())
                    .variantName(variantName.trim())
                    .imageUrl(imageUrl) // Ảnh đã được lấy an toàn
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