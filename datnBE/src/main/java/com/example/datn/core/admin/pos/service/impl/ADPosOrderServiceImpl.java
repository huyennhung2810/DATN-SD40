package com.example.datn.core.admin.pos.service.impl;

import com.example.datn.core.admin.pos.repository.ADPosOrderDetailRepository;
import com.example.datn.core.admin.pos.repository.ADPosOrderRepository;
import com.example.datn.core.admin.pos.service.ADPosOrderService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.Order;
import com.example.datn.entity.OrderDetail;
import com.example.datn.entity.Serial;
import com.example.datn.infrastructure.constant.OrderStatus;
import com.example.datn.infrastructure.constant.SerialStatus;
import com.example.datn.infrastructure.constant.TypeInvoice;
import com.example.datn.repository.CustomerRepository;
import com.example.datn.repository.SerialRepository;
import com.example.datn.repository.WarrantyRepository;
import com.example.datn.entity.Customer;
import com.example.datn.entity.Warranty;
import lombok.RequiredArgsConstructor;
import java.util.Date;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ADPosOrderServiceImpl implements ADPosOrderService {

    private final ADPosOrderRepository posOrderRepository;
    private final ADPosOrderDetailRepository posOrderDetailRepository;
    private final SerialRepository serialRepository;
    private final CustomerRepository customerRepository;
    private final WarrantyRepository warrantyRepository;

    @Override
    @Transactional
    public ResponseObject<?> createEmptyOrder() {
        Order order = new Order();
        order.setOrderStatus(OrderStatus.PENDING);
        order.setOrderType(TypeInvoice.OFFLINE);
        order.setTotalAmount(BigDecimal.ZERO);
        order.setTotalAfterDiscount(BigDecimal.ZERO);
        posOrderRepository.save(order);
        return ResponseObject.success(order, "Tạo hóa đơn tại quầy thành công");
    }

    @Override
    @Transactional
    public ResponseObject<?> addSerialToOrder(String orderId, String serialNumber) {
        Order order = posOrderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn: " + orderId);
        }

        Serial serial = serialRepository.findBySerialNumber(serialNumber).orElse(null);
        if (serial == null) {
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy thiết bị với mã Serial: " + serialNumber);
        }

        if (serial.getSerialStatus() != SerialStatus.AVAILABLE) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Thiết bị này không ở trạng thái có sẵn để bán");
        }

        List<OrderDetail> existingDetails = posOrderDetailRepository.findByOrderId(orderId);

        OrderDetail targetDetail = null;
        for (OrderDetail detail : existingDetails) {
            if (detail.getProductDetail().getId().equals(serial.getProductDetail().getId())) {
                targetDetail = detail;
                break;
            }
        }

        BigDecimal unitPrice = serial.getProductDetail().getSalePrice();
        if (unitPrice == null) {
            unitPrice = BigDecimal.ZERO;
        }

        if (targetDetail == null) {
            targetDetail = new OrderDetail();
            targetDetail.setOrder(order);
            targetDetail.setProductDetail(serial.getProductDetail());
            targetDetail.setQuantity(1);
            targetDetail.setUnitPrice(unitPrice);
            targetDetail.setTotalPrice(unitPrice);
        } else {
            targetDetail.setQuantity(targetDetail.getQuantity() + 1);
            targetDetail.setTotalPrice(unitPrice.multiply(new BigDecimal(targetDetail.getQuantity())));
        }

        posOrderDetailRepository.save(targetDetail);

        // Map Serial to OrderDetail and Reserve it
        serial.setOrderDetail(targetDetail);
        serial.setSerialStatus(SerialStatus.RESERVED);
        serialRepository.save(serial);

        // Update Order total
        BigDecimal newTotal = order.getTotalAmount().add(unitPrice);
        order.setTotalAmount(newTotal);
        order.setTotalAfterDiscount(newTotal);
        posOrderRepository.save(order);

        return ResponseObject.success(targetDetail,
                "Thêm sản phẩm mang mã Serial " + serialNumber + " vào hóa đơn thành công");
    }

    @Override
    public ResponseObject<?> getPendingOrders() {
        List<Order> list = posOrderRepository.findAll().stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.PENDING && o.getOrderType() == TypeInvoice.OFFLINE)
                .toList();
        return ResponseObject.success(list, "Lấy danh sách hóa đơn chờ thành công");
    }

    @Override
    public ResponseObject<?> getOrderDetails(String orderId) {
        Order order = posOrderRepository.findById(orderId).orElse(null);
        if (order == null)
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn");

        List<OrderDetail> details = posOrderDetailRepository.findByOrderId(orderId);
        // Note: For a real POS, we should map this to a DTO including the list of
        // serials for each detail.
        // For simplicity we return the details as-is.
        return ResponseObject.success(details, "Lấy chi tiết hóa đơn thành công");
    }

    @Override
    @Transactional
    public ResponseObject<?> removeSerialFromOrder(String orderId, String serialNumber) {
        Order order = posOrderRepository.findById(orderId).orElse(null);
        if (order == null)
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn");

        Serial serial = serialRepository.findBySerialNumber(serialNumber).orElse(null);
        if (serial == null || serial.getOrderDetail() == null
                || !serial.getOrderDetail().getOrder().getId().equals(orderId)) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Serial này không nằm trong hóa đơn hiện tại");
        }

        OrderDetail targetDetail = serial.getOrderDetail();

        // Remove serial link and make it available again
        serial.setOrderDetail(null);
        serial.setSerialStatus(SerialStatus.AVAILABLE);
        serialRepository.save(serial);

        BigDecimal unitPrice = targetDetail.getUnitPrice() != null ? targetDetail.getUnitPrice() : BigDecimal.ZERO;

        if (targetDetail.getQuantity() > 1) {
            targetDetail.setQuantity(targetDetail.getQuantity() - 1);
            targetDetail.setTotalPrice(targetDetail.getTotalPrice().subtract(unitPrice));
            posOrderDetailRepository.save(targetDetail);
        } else {
            posOrderDetailRepository.delete(targetDetail);
        }

        // Update Order total
        BigDecimal newTotal = order.getTotalAmount().subtract(unitPrice);
        if (newTotal.compareTo(BigDecimal.ZERO) < 0)
            newTotal = BigDecimal.ZERO;
        order.setTotalAmount(newTotal);
        order.setTotalAfterDiscount(newTotal);
        posOrderRepository.save(order);

        return ResponseObject.success(null, "Đã xóa serial " + serialNumber + " khỏi hóa đơn");
    }

    @Override
    @Transactional
    public ResponseObject<?> setCustomerForOrder(String orderId, String customerId) {
        Order order = posOrderRepository.findById(orderId).orElse(null);
        if (order == null)
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn");

        Customer customer = customerRepository.findById(customerId).orElse(null);
        if (customer == null)
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng");

        order.setCustomer(customer);
        posOrderRepository.save(order);

        return ResponseObject.success(order, "Đã gắn khách hàng vào hóa đơn");
    }

    @Override
    @Transactional
    public ResponseObject<?> checkoutOrder(String orderId) {
        Order order = posOrderRepository.findById(orderId).orElse(null);
        if (order == null)
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn");
        if (order.getOrderStatus() != OrderStatus.PENDING) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Hóa đơn này không ở trạng thái chờ thanh toán");
        }

        // Update Order status
        order.setOrderStatus(OrderStatus.COMPLETED);
        order.setPaymentDate(new Date().getTime());
        order.setPaymentMethod("TIEN_MAT"); // Hardcode for now

        List<OrderDetail> details = posOrderDetailRepository.findByOrderId(orderId);
        if (details.isEmpty()) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Hóa đơn trống, không thể thanh toán");
        }

        // For each detail, find the associated serials and generate warranty
        for (OrderDetail detail : details) {
            for (Serial serial : detail.getProductDetail().getSerials()) {
                if (serial.getOrderDetail() != null && serial.getOrderDetail().getId().equals(detail.getId())) {
                    // Update Serial status
                    serial.setSerialStatus(SerialStatus.SOLD);
                    serialRepository.save(serial);

                    // Generate Warranty
                    Warranty warranty = new Warranty();
                    warranty.setSerial(serial);
                    warranty.setStartDate(new Date().getTime());
                    // default 1 year warranty
                    warranty.setEndDate(new Date().getTime() + 31536000000L);
                    warranty.setNote("Bảo hành tự động khi mua tại quầy");
                    warrantyRepository.save(warranty);
                }
            }
        }

        posOrderRepository.save(order);
        return ResponseObject.success(order, "Thanh toán thành công");
    }
}
