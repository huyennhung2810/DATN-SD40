package com.example.datn.core.admin.pos.service.impl;

import com.example.datn.core.admin.pos.repository.ADPosOrderDetailRepository;
import com.example.datn.core.admin.pos.repository.ADPosOrderRepository;
import com.example.datn.core.admin.discountDetail.repository.ADDiscountDetailRepository;
import com.example.datn.core.admin.pos.service.ADPosOrderService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.*;
import com.example.datn.infrastructure.constant.OrderStatus;
import com.example.datn.infrastructure.constant.SerialStatus;
import com.example.datn.infrastructure.constant.TypeInvoice;
import com.example.datn.repository.*;
import com.example.datn.core.admin.vouchers.repository.ADVouchersRepository;
import com.example.datn.core.admin.vouchers.model.response.VoucherResponse;
import com.example.datn.infrastructure.constant.PaymentStatus;

import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import java.util.Date;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ADPosOrderServiceImpl implements ADPosOrderService {

    private final ADPosOrderRepository posOrderRepository;
    private final ADPosOrderDetailRepository posOrderDetailRepository;
    private final SerialRepository serialRepository;
    private final CustomerRepository customerRepository;
    private final WarrantyRepository warrantyRepository;
    private final ProductDetailRepository productDetailRepository;
    private final ADDiscountDetailRepository adDiscountDetailRepository;
    private final ADVouchersRepository adVouchersRepository;
    private final EmployeeRepository employeeRepository;
    private final OrderHistoryRepository orderHistoryRepository;

    @Override
    @Transactional
    public ResponseObject<?> createEmptyOrder() {
        long pendingCount = posOrderRepository.findAll().stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.CHO_XAC_NHAN && o.getOrderType() == TypeInvoice.OFFLINE)
                .count();
        if (pendingCount >= 10) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST,
                    "Đã đạt giới hạn tối đa 10 hóa đơn chờ. Vui lòng thanh toán hoặc hủy bớt hóa đơn trước khi tạo mới.");
        }
        Order order = new Order();
        order.setOrderStatus(OrderStatus.CHO_XAC_NHAN);
        order.setOrderType(TypeInvoice.OFFLINE);
        order.setTotalAmount(BigDecimal.ZERO);
        order.setTotalAfterDiscount(BigDecimal.ZERO);
        // Gán nhân viên thực hiện bán hàng tại thời điểm tạo hóa đơn
        Employee currentEmployee = getCurrentEmployee();
        order.setEmployee(currentEmployee);
        posOrderRepository.save(order);
        return ResponseObject.success(order, "Tạo hóa đơn tại quầy thành công");
    }

    // Lấy nhân viên
    private Employee getCurrentEmployee() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Không xác định được nhân viên thực hiện");
        }

        String username = authentication.getName();

        return employeeRepository.findByAccount_Username(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên: " + username));
    }

    @Override
    @Transactional
    public ResponseObject<?> addProductToOrder(String orderId, String productDetailId, int quantity) {
        Order order = posOrderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn: " + orderId);
        }

        ProductDetail productDetail = productDetailRepository.findById(productDetailId).orElse(null);
        if (productDetail == null) {
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm");
        }

        List<OrderDetail> existingDetails = posOrderDetailRepository.findByOrderId(orderId);

        OrderDetail targetDetail = null;
        for (OrderDetail detail : existingDetails) {
            if (detail.getProductDetail().getId().equals(productDetail.getId())) {
                targetDetail = detail;
                break;
            }
        }

        BigDecimal unitPrice = productDetail.getSalePrice();
        if (unitPrice == null) {
            unitPrice = BigDecimal.ZERO;
        }

        // --- CHECK ACTIVE PRODUCT DISCOUNT ---
        Optional<DiscountDetail> discountDetail = adDiscountDetailRepository
                .findActiveByProductDetailId(productDetailId, System.currentTimeMillis());
        if (discountDetail.isPresent()) {
            unitPrice = discountDetail.get().getPriceAfter();
        }
        // ------------------------------------

        if (targetDetail == null) {
            targetDetail = new OrderDetail();
            targetDetail.setOrder(order);
            targetDetail.setProductDetail(productDetail);
            targetDetail.setQuantity(quantity);
            targetDetail.setUnitPrice(unitPrice);
            targetDetail.setTotalPrice(unitPrice.multiply(new BigDecimal(quantity)));
        } else {
            int newQuantity = targetDetail.getQuantity() + quantity;
            targetDetail.setQuantity(newQuantity);
            // Re-calculate unit price in case discount status changed or for consistency
            targetDetail.setUnitPrice(unitPrice);
            targetDetail.setTotalPrice(unitPrice.multiply(new BigDecimal(newQuantity)));
        }

        posOrderDetailRepository.save(targetDetail);

        // Recalculate order totals based on cart contents
        List<OrderDetail> allDetails = posOrderDetailRepository.findByOrderId(orderId);
        BigDecimal newTotal = allDetails.stream()
                .map(OrderDetail::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotalAmount(newTotal);

        // Recalculate totalAfterDiscount respecting any applied voucher
        order.setTotalAfterDiscount(calculateTotalAfterVoucher(newTotal, order.getVoucher()));

        posOrderRepository.save(order);

        return ResponseObject.success(targetDetail, "Thêm sản phẩm vào hóa đơn thành công");
    }

    @Override
    @Transactional
    public ResponseObject<?> assignSerialsToOrderDetail(String orderId, String detailId, List<String> serialNumbers) {
        OrderDetail detail = posOrderDetailRepository.findById(detailId).orElse(null);
        if (detail == null || !detail.getOrder().getId().equals(orderId)) {
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy chi tiết hóa đơn");
        }

        if (serialNumbers.size() != detail.getQuantity()) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Số lượng Serial gán (" + serialNumbers.size()
                    + ") phải bằng số lượng yêu cầu (" + detail.getQuantity() + ")");
        }

        List<Serial> targetSerials = serialRepository.findBySerialNumberIn(serialNumbers);
        if (targetSerials.size() != serialNumbers.size()) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Một số mã Serial không tồn tại");
        }

        for (Serial serial : targetSerials) {
            if (!serial.getProductDetail().getId().equals(detail.getProductDetail().getId())) {
                return ResponseObject.error(HttpStatus.BAD_REQUEST,
                        "Serial " + serial.getSerialNumber() + " không thuộc sản phẩm này");
            }
            // Allow AVAILABLE or RESERVED-by-this-same-detail
            boolean isAvailable = serial.getSerialStatus() == SerialStatus.AVAILABLE;
            boolean isReservedBySelf = serial.getSerialStatus() == SerialStatus.RESERVED
                    && serial.getOrderDetail() != null
                    && serial.getOrderDetail().getId().equals(detailId);
            if (!isAvailable && !isReservedBySelf) {
                return ResponseObject.error(HttpStatus.BAD_REQUEST,
                        "Serial " + serial.getSerialNumber() + " không ở trạng thái sẵn sàng");
            }
        }

        // Release previously assigned serials for this detail (not in new list)
        List<String> newSerialNumbers = serialNumbers;
        List<Serial> oldSerials = serialRepository.findAll().stream()
                .filter(s -> s.getOrderDetail() != null
                        && s.getOrderDetail().getId().equals(detailId)
                        && !newSerialNumbers.contains(s.getSerialNumber()))
                .toList();
        for (Serial old : oldSerials) {
            old.setOrderDetail(null);
            old.setSerialStatus(SerialStatus.AVAILABLE);
        }
        if (!oldSerials.isEmpty()) {
            serialRepository.saveAll(oldSerials);
        }

        for (Serial serial : targetSerials) {
            serial.setOrderDetail(detail);
            serial.setSerialStatus(SerialStatus.RESERVED);
        }
        serialRepository.saveAll(targetSerials);

        return ResponseObject.success(detail, "Đã gán Serial thành công");
    }

    @Override
    public ResponseObject<?> getPendingOrders() {
        List<Order> list = posOrderRepository.findByOrderStatusAndOrderType(OrderStatus.CHO_XAC_NHAN,
                TypeInvoice.OFFLINE);

        List<Map<String, Object>> result = list.stream().map(o -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", o.getId());
            map.put("code", o.getCode());
            map.put("totalAmount", o.getTotalAmount());
            map.put("totalAfterDiscount", o.getTotalAfterDiscount());
            map.put("orderStatus", o.getOrderStatus());

            if (o.getVoucher() != null) {
                Map<String, Object> vMap = new HashMap<>();
                vMap.put("id", o.getVoucher().getId());
                vMap.put("code", o.getVoucher().getCode());
                vMap.put("discountValue", o.getVoucher().getDiscountValue());
                vMap.put("discountUnit", o.getVoucher().getDiscountUnit());
                vMap.put("maxDiscountAmount", o.getVoucher().getMaxDiscountAmount());
                map.put("voucher", vMap);
            } else {
                map.put("voucher", null);
            }

            if (o.getCustomer() != null) {
                Map<String, Object> cMap = new HashMap<>();
                cMap.put("id", o.getCustomer().getId());
                cMap.put("name", o.getCustomer().getName());
                cMap.put("phoneNumber", o.getCustomer().getPhoneNumber());
                map.put("customer", cMap);
            }
            return map;
        }).collect(Collectors.toList());

        return ResponseObject.success(result, "Lấy danh sách hóa đơn chờ thành công");
    }

    @Override
    public ResponseObject<?> getOrderDetails(String orderId) {
        Order order = posOrderRepository.findById(orderId).orElse(null);
        if (order == null)
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn");

        List<OrderDetail> details = posOrderDetailRepository.findByOrderId(orderId);

        // Map elements to DTO to prevent infinite recursion and lazy initialization
        // exceptions
        List<Map<String, Object>> result = details.stream().map(d -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", d.getId());
            map.put("quantity", d.getQuantity());
            map.put("unitPrice", d.getUnitPrice());
            map.put("totalPrice", d.getTotalPrice());

            List<Serial> detailSerials = serialRepository.findAll().stream()
                    .filter(s -> s.getOrderDetail() != null && s.getOrderDetail().getId().equals(d.getId()))
                    .toList();
            long assignedCount = detailSerials.size();
            map.put("assignedSerialsCount", assignedCount);
            map.put("assignedSerials", detailSerials.stream()
                    .map(s -> {
                        Map<String, Object> sm = new HashMap<>();
                        sm.put("id", s.getId());
                        sm.put("serialNumber", s.getSerialNumber());
                        sm.put("code", s.getCode());
                        return sm;
                    }).collect(Collectors.toList()));

            Map<String, Object> pdMap = new HashMap<>();
            if (d.getProductDetail() != null) {
                pdMap.put("id", d.getProductDetail().getId());
                pdMap.put("code", d.getProductDetail().getCode());
                pdMap.put("version", d.getProductDetail().getVersion());
                String imageUrl = null;
                if (d.getProductDetail().getProduct() != null
                        && !d.getProductDetail().getProduct().getImages().isEmpty()) {
                    imageUrl = d.getProductDetail().getProduct().getImages().get(0).getUrl();
                }
                pdMap.put("image", imageUrl);
                // Add original price to help FE show "Price Before vs Price After"
                BigDecimal originalPrice = d.getProductDetail().getSalePrice();
                pdMap.put("originalPrice", originalPrice);

                Map<String, Object> productMap = new HashMap<>();
                if (d.getProductDetail().getProduct() != null) {
                    productMap.put("id", d.getProductDetail().getProduct().getId());
                    productMap.put("code", d.getProductDetail().getProduct().getCode());
                    productMap.put("name", d.getProductDetail().getProduct().getName());
                }
                pdMap.put("product", productMap);

                Map<String, Object> colorMap = new HashMap<>();
                if (d.getProductDetail().getColor() != null) {
                    colorMap.put("id", d.getProductDetail().getColor().getId());
                    colorMap.put("name", d.getProductDetail().getColor().getName());
                }
                pdMap.put("color", colorMap);
            }
            map.put("productDetail", pdMap);

            return map;
        }).collect(Collectors.toList());

        return ResponseObject.success(result, "Lấy chi tiết hóa đơn thành công");
    }

    @Override
    @Transactional
    public ResponseObject<?> removeSerialFromOrderDetail(String orderId, String detailId, String serialNumber) {
        Serial serial = serialRepository.findBySerialNumber(serialNumber).orElse(null);
        if (serial == null || serial.getOrderDetail() == null
                || !serial.getOrderDetail().getId().equals(detailId)) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Serial này không nằm trong chi tiết hóa đơn hiện tại");
        }

        serial.setOrderDetail(null);
        serial.setSerialStatus(SerialStatus.AVAILABLE);
        serialRepository.save(serial);

        return ResponseObject.success(null, "Đã Xóa serial " + serialNumber + " khỏi sản phẩm");
    }

    @Override
    @Transactional
    public ResponseObject<?> removeProductFromOrder(String orderId, String detailId) {
        OrderDetail targetDetail = posOrderDetailRepository.findById(detailId).orElse(null);
        if (targetDetail == null || !targetDetail.getOrder().getId().equals(orderId)) {
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy chi tiết hóa đơn");
        }

        // Free any reserved serials
        List<Serial> reservedSerials = targetDetail.getProductDetail().getSerials().stream()
                .filter(s -> s.getOrderDetail() != null && s.getOrderDetail().getId().equals(detailId))
                .toList();
        for (Serial serial : reservedSerials) {
            serial.setOrderDetail(null);
            serial.setSerialStatus(SerialStatus.AVAILABLE);
        }
        if (!reservedSerials.isEmpty()) {
            serialRepository.saveAll(reservedSerials);
        }

        // Update Order total
        Order order = targetDetail.getOrder();
        BigDecimal newTotal = order.getTotalAmount().subtract(targetDetail.getTotalPrice());
        if (newTotal.compareTo(BigDecimal.ZERO) < 0)
            newTotal = BigDecimal.ZERO;
        order.setTotalAmount(newTotal);

        // Recalculate totalAfterDiscount respecting any applied voucher
        order.setTotalAfterDiscount(calculateTotalAfterVoucher(newTotal, order.getVoucher()));

        posOrderRepository.save(order);

        posOrderDetailRepository.delete(targetDetail);

        return ResponseObject.success(null, "Đã xóa sản phẩm khỏi hóa đơn");
    }

    @Override
    @Transactional
    public ResponseObject<?> setCustomerForOrder(String orderId, String customerId) {

        Order order = posOrderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn");
        }

        Customer customer = customerRepository.findById(customerId).orElse(null);
        if (customer == null) {
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng");
        }

        order.setCustomer(customer);
        order.setRecipientName(customer.getName());
        order.setRecipientPhone(customer.getPhoneNumber());
        order.setRecipientEmail(customer.getEmail());

        // 🔥 Lấy địa chỉ mặc định
        Address address = customer.getAddresses().stream()
                .filter(addr -> Boolean.TRUE.equals(addr.getIsDefault()))
                .findFirst()
                .orElse(null);

        if (address == null && !customer.getAddresses().isEmpty()) {
            address = customer.getAddresses().get(0);
        }

        if (address != null) {
            order.setRecipientAddress(address.getFullAddress());
        }

        posOrderRepository.save(order);

        return ResponseObject.success(order, "Đã gắn khách hàng vào hóa đơn");
    }

    @Override
    @Transactional
    public ResponseObject<?> checkoutOrder(String orderId) {
        Order order = posOrderRepository.findById(orderId).orElse(null);
        if (order == null)
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn");
        if (order.getOrderStatus() != OrderStatus.CHO_XAC_NHAN) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Hóa đơn này không ở trạng thái chờ thanh toán");
        }

        // Update Order status
        order.setOrderStatus(OrderStatus.HOAN_THANH);
        order.setPaymentDate(new Date().getTime());
        order.setPaymentMethod("TIEN_MAT"); // Hardcode for now
        // Gán trạng thái thanh toán
        order.setPaymentStatus(PaymentStatus.DA_THANH_TOAN);

        List<OrderDetail> details = posOrderDetailRepository.findByOrderId(orderId);
        if (details.isEmpty()) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Hóa đơn trống, không thể thanh toán");
        }

        // Validate all details have correct number of assigned serials
        boolean isMissingSerials = false;
        for (OrderDetail detail : details) {
            long assignedSerialsCount = serialRepository.findAll().stream()
                    .filter(s -> s.getOrderDetail() != null && s.getOrderDetail().getId().equals(detail.getId()))
                    .count();
            if (assignedSerialsCount != detail.getQuantity()) {
                isMissingSerials = true;
                break;
            }
        }
        if (isMissingSerials) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST,
                    "Vui lòng gán đầy đủ mã Serial cho các sản phẩm trong hóa đơn trước khi thanh toán");
        }

        // For each detail, find the associated serials and generate warranty
        for (OrderDetail detail : details) {
            ProductDetail productDetail = detail.getProductDetail();
            int newQuantity = productDetail.getQuantity() - detail.getQuantity();
            if (newQuantity < 0)
                newQuantity = 0;
            productDetail.setQuantity(newQuantity);
            productDetailRepository.save(productDetail);

            List<Serial> assignedSerials = serialRepository.findAll().stream()
                    .filter(s -> s.getOrderDetail() != null && s.getOrderDetail().getId().equals(detail.getId()))
                    .toList();
            for (Serial serial : assignedSerials) {
                // Update Serial status
                serial.setSerialStatus(SerialStatus.SOLD);
                serial.setStatus(com.example.datn.infrastructure.constant.EntityStatus.INACTIVE);
                serialRepository.save(serial);

                // Generate Warranty
                Warranty warranty = new Warranty();
                warranty.setSerial(serial);
                warranty.setStartDate(new Date().getTime());
                warranty.setEndDate(new Date().getTime() + 31536000000L);
                warranty.setNote("Bảo hành tự động khi mua tại quầy");
                warrantyRepository.save(warranty);
            }
        }

        posOrderRepository.save(order);

        // Record checkout history
        OrderHistory lichSu = new OrderHistory();
        lichSu.setOrder(order);
        lichSu.setHoaDon(order);
        lichSu.setTrangThai(OrderStatus.HOAN_THANH);
        lichSu.setThoiGian(LocalDateTime.now());
        lichSu.setNote("Thanh toán tại quầy");
        lichSu.setNhanVien(getCurrentEmployee());
        orderHistoryRepository.save(lichSu);

        return ResponseObject.success(order, "Thanh toán thành công");
    }

    @Override
    @Transactional
    public ResponseObject<?> cancelOrder(String orderId) {
        Order order = posOrderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn");
        }
        if (order.getOrderStatus() != OrderStatus.CHO_XAC_NHAN) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Chỉ có thể hủy/xóa hóa đơn ở trạng thái CHỜ");
        }

        List<OrderDetail> details = posOrderDetailRepository.findByOrderId(orderId);
        for (OrderDetail detail : details) {
            List<Serial> reservedSerials = detail.getProductDetail().getSerials().stream()
                    .filter(s -> s.getOrderDetail() != null && s.getOrderDetail().getId().equals(detail.getId()))
                    .toList();
            for (Serial serial : reservedSerials) {
                serial.setOrderDetail(null);
                serial.setSerialStatus(SerialStatus.AVAILABLE);
            }
            if (!reservedSerials.isEmpty()) {
                serialRepository.saveAll(reservedSerials);
            }
            posOrderDetailRepository.delete(detail);
        }

        posOrderRepository.delete(order);
        return ResponseObject.success(null, "Đã hủy hóa đơn thành công");
    }

    @Override
    public ResponseObject<?> getAvailableSerials(String productDetailId) {
        if (productDetailId == null || productDetailId.isBlank()) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Mã sản phẩm chi tiết không được để trống");
        }
        List<Serial> availableSerials = serialRepository.findAll().stream()
                .filter(s -> s.getProductDetail() != null
                        && s.getProductDetail().getId().equals(productDetailId)
                        && s.getSerialStatus() == SerialStatus.AVAILABLE)
                .toList();

        List<Map<String, Object>> result = availableSerials.stream().map(s -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", s.getId());
            map.put("serialNumber", s.getSerialNumber());
            map.put("code", s.getCode());
            return map;
        }).collect(Collectors.toList());

        return ResponseObject.success(result, "Lấy danh sách Serial khả dụng thành công");
    }

    private BigDecimal calculateTotalAfterVoucher(BigDecimal total, Voucher voucher) {
        if (voucher == null)
            return total;
        BigDecimal discount = BigDecimal.ZERO;

        // Lấy đơn vị giảm giá, cắt bỏ mọi khoảng trắng thừa và kiểm tra an toàn
        String unit = voucher.getDiscountUnit() != null ? voucher.getDiscountUnit().trim() : "";

        if ("%".equalsIgnoreCase(unit) || "PERCENT".equalsIgnoreCase(unit)) {
            // Trường hợp giảm theo %
            discount = total.multiply(voucher.getDiscountValue()).divide(new BigDecimal("100"));
            // So sánh với số tiền giảm tối đa (nếu có)
            if (voucher.getMaxDiscountAmount() != null && discount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
                discount = voucher.getMaxDiscountAmount();
            }
        } else {
            // Trường hợp giảm theo VND
            discount = voucher.getDiscountValue() != null ? voucher.getDiscountValue() : BigDecimal.ZERO;
        }

        BigDecimal result = total.subtract(discount);
        return result.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : result;
    }

    @Override
    public ResponseObject<?> getApplicableVouchers(java.math.BigDecimal orderTotal) {
        long now = System.currentTimeMillis();
        List<VoucherResponse> applicable = adVouchersRepository.findAll().stream()
                .filter(v -> v.getStatus() != null && (v.getStatus() == 1 || v.getStatus() == 2)
                        && v.getQuantity() != null && v.getQuantity() > 0
                        && v.getStartDate() != null && v.getStartDate() <= now
                        && v.getEndDate() != null && v.getEndDate() >= now
                        && (v.getConditions() == null || v.getConditions().compareTo(orderTotal) <= 0))
                .map(VoucherResponse::new)
                .collect(Collectors.toList());

        return ResponseObject.success(applicable, "Lấy danh sách voucher áp dụng được");
    }

    @Override
    @Transactional
    public ResponseObject<?> applyVoucher(String orderId, String voucherId) {
        Order order = posOrderRepository.findById(orderId).orElse(null);
        if (order == null)
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn");
        Voucher voucher = adVouchersRepository.findById(voucherId).orElse(null);
        if (voucher == null)
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy voucher");
        if (voucher.getConditions() != null && order.getTotalAmount().compareTo(voucher.getConditions()) < 0) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST,
                    "Đơn hàng chưa đạt giá trị tối thiểu " + voucher.getConditions().toPlainString()
                            + " để dùng voucher này");
        }
        order.setVoucher(voucher);
        order.setTotalAfterDiscount(calculateTotalAfterVoucher(order.getTotalAmount(), voucher));
        posOrderRepository.save(order);
        Map<String, Object> resp = new HashMap<>();
        resp.put("voucherId", voucher.getId());
        resp.put("voucherCode", voucher.getCode());
        resp.put("totalAfterDiscount", order.getTotalAfterDiscount());
        return ResponseObject.success(resp, "Áp dụng voucher thành công");
    }

    @Override
    @Transactional
    public ResponseObject<?> removeVoucher(String orderId) {
        Order order = posOrderRepository.findById(orderId).orElse(null);
        if (order == null)
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn");
        order.setVoucher(null);
        order.setTotalAfterDiscount(order.getTotalAmount());
        posOrderRepository.save(order);
        return ResponseObject.success(null, "Đã bỏ voucher");
    }
}
