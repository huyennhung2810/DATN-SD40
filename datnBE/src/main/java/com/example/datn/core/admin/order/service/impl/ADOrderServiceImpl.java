package com.example.datn.core.admin.order.service.impl;

import com.example.datn.core.admin.order.repository.ADOrderDetailRepository;
import com.example.datn.core.admin.order.repository.ADOrderRepository;
import com.example.datn.core.admin.order.service.ADOrderService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.Order;
import com.example.datn.entity.OrderDetail;
import com.example.datn.entity.Serial;
import com.example.datn.entity.Warranty;
import com.example.datn.infrastructure.constant.OrderStatus;
import com.example.datn.infrastructure.constant.SerialStatus;
import com.example.datn.repository.SerialRepository;
import com.example.datn.repository.WarrantyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ADOrderServiceImpl implements ADOrderService {

    private final ADOrderRepository orderRepository;
    private final ADOrderDetailRepository orderDetailRepository;
    private final SerialRepository serialRepository;
    private final WarrantyRepository warrantyRepository;

    @Override
    public ResponseObject<?> searchOrders(OrderStatus status, String keyword, Pageable pageable) {
        Page<Order> orderPage = orderRepository.searchOrders(status, keyword, pageable);
        return ResponseObject.success(orderPage, "Lấy danh sách thành công");
    }

    @Override
    public ResponseObject<?> getOrderDetails(String orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null)
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy CĐH");
        List<OrderDetail> details = orderDetailRepository.findByOrderId(orderId);
        // Có thể cần map thêm Serials vào DTO cho FE dễ hiển thị
        return ResponseObject.success(details, "Lấy chi tiết đơn hàng thành công");
    }

    @Override
    @Transactional
    public ResponseObject<?> assignSerialsToDetail(String orderId, String detailId, List<String> serialNumbers) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null)
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy CĐH");

        OrderDetail detail = orderDetailRepository.findById(detailId).orElse(null);
        if (detail == null || !detail.getOrder().getId().equals(orderId)) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Detail không hợp lệ");
        }

        if (serialNumbers.size() > detail.getQuantity()) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Số lượng mã Serial vượt quá số lượng sản phẩm mua");
        }

        // Validate and assign
        for (String sn : serialNumbers) {
            Serial serial = serialRepository.findBySerialNumber(sn).orElse(null);
            if (serial == null)
                return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy Serial: " + sn);
            if (serial.getSerialStatus() != SerialStatus.AVAILABLE) {
                return ResponseObject.error(HttpStatus.BAD_REQUEST, "Serial " + sn + " không sẵn sàng");
            }
            if (!serial.getProductDetail().getId().equals(detail.getProductDetail().getId())) {
                return ResponseObject.error(HttpStatus.BAD_REQUEST,
                        "Serial " + sn + " không thuộc phân loại sản phẩm này");
            }

            // Assign
            serial.setOrderDetail(detail);
            serial.setSerialStatus(SerialStatus.RESERVED);
            serialRepository.save(serial);
        }

        return ResponseObject.success(detail, "Đã gán " + serialNumbers.size() + " Serial thành công");
    }

    @Override
    @Transactional
    public ResponseObject<?> updateOrderStatus(String orderId, OrderStatus newStatus, String note) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null)
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy CĐH");

        // Simple state machine validation can be added here

        // Handle COMPLETED
        if (newStatus == OrderStatus.COMPLETED && order.getOrderStatus() != OrderStatus.COMPLETED) {
            // Đã giao thành công -> Kích hoạt bảo hành
            List<OrderDetail> details = orderDetailRepository.findByOrderId(orderId);
            for (OrderDetail detail : details) {
                for (Serial serial : detail.getProductDetail().getSerials()) {
                    if (serial.getOrderDetail() != null && serial.getOrderDetail().getId().equals(detail.getId())) {
                        serial.setSerialStatus(SerialStatus.SOLD);
                        serialRepository.save(serial);

                        // Save Warranty
                        Warranty warranty = new Warranty();
                        warranty.setSerial(serial);
                        warranty.setStartDate(new Date().getTime());
                        warranty.setEndDate(new Date().getTime() + 31536000000L); // 1 year
                        warranty.setNote(note != null ? note : "Bảo hành tự động khi hoàn thành giao hàng");
                        warrantyRepository.save(warranty);
                    }
                }
            }
            order.setPaymentDate(new Date().getTime());
        }

        // Handle CANCELED / DELIVERY_FAILED / RETURNED -> Restore Serials back to
        // inventory
        if (newStatus == OrderStatus.CANCELED || newStatus == OrderStatus.DELIVERY_FAILED
                || newStatus == OrderStatus.RETURNED) {
            List<OrderDetail> details = orderDetailRepository.findByOrderId(orderId);
            for (OrderDetail detail : details) {
                for (Serial serial : detail.getProductDetail().getSerials()) {
                    if (serial.getOrderDetail() != null && serial.getOrderDetail().getId().equals(detail.getId())) {
                        serial.setOrderDetail(null);
                        // If returned because broken, status = DEFECTIVE. Else AVAILABLE
                        serial.setSerialStatus(
                                newStatus == OrderStatus.RETURNED ? SerialStatus.DEFECTIVE : SerialStatus.AVAILABLE);
                        serialRepository.save(serial);
                    }
                }
            }
        }

        order.setOrderStatus(newStatus);
        // Note can be appended to order notes if a field exists, currently skipping
        orderRepository.save(order);

        return ResponseObject.success(order, "Đã cập nhật trạng thái đơn thành: " + newStatus.getLabel());
    }
}
