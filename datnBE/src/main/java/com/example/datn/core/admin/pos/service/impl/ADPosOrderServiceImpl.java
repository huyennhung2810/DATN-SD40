package com.example.datn.core.admin.pos.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.example.datn.core.admin.pos.repository.ADPosOrderDetailRepository;
import com.example.datn.core.admin.pos.repository.ADPosOrderRepository;
import com.example.datn.core.admin.discount.repository.ADDiscountRepository;
import com.example.datn.core.admin.discountDetail.repository.ADDiscountDetailRepository;
import com.example.datn.core.admin.pos.service.ADPosOrderService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.*;
import com.example.datn.infrastructure.constant.OrderStatus;
import com.example.datn.infrastructure.payment.VNPayConfig;
import com.example.datn.infrastructure.payment.VNPayService;
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

    private static final String PAYMENT_METHOD_CASH = "TIEN_MAT";
    private static final int MAX_PENDING_ORDERS = 10;
    private static final String MSG_MAX_PENDING = "Đã đạt giới hạn tối đa 10 hóa đơn chờ. Vui lòng thanh toán hoặc hủy bớt hóa đơn trước khi tạo mới.";
    private static final String MSG_ORDER_NOT_FOUND = "Không tìm thấy hóa đơn";
    private static final String MSG_PRODUCT_NOT_FOUND = "Không tìm thấy sản phẩm";
    private static final String MSG_CUSTOMER_NOT_FOUND = "Không tìm thấy khách hàng";
    private static final String MSG_SERIAL_NOT_FOUND = "Một số mã Serial không tồn tại";
    private static final String MSG_SERIAL_NOT_BELONG = "Serial %s không thuộc sản phẩm này";
    private static final String MSG_SERIAL_NOT_READY = "Serial %s không ở trạng thái sẵn sàng";
    private static final String MSG_SERIAL_NOT_IN_DETAIL = "Serial này không nằm trong chi tiết hóa đơn hiện tại";
    private static final String MSG_REMOVE_PRODUCT = "Đã xóa sản phẩm khỏi hóa đơn";
    private static final String MSG_ASSIGN_SERIAL_SUCCESS = "Đã gán Serial thành công";
    private static final String MSG_REMOVE_SERIAL_SUCCESS = "Đã Xóa serial %s khỏi sản phẩm";
    private static final String MSG_ORDER_EMPTY = "Hóa đơn trống, không thể thanh toán";
    private static final String MSG_SERIAL_NOT_ENOUGH = "Vui lòng gán đầy đủ mã Serial cho các sản phẩm trong hóa đơn trước khi thanh toán";
    private static final String MSG_ORDER_CANCEL_SUCCESS = "Đã hủy hóa đơn thành công";
    private static final String MSG_VOUCHER_NOT_FOUND = "Không tìm thấy voucher";
    private static final String MSG_VOUCHER_CONDITION = "Đơn hàng chưa đạt giá trị tối thiểu %s để dùng voucher này";
    private static final String MSG_REMOVE_VOUCHER = "Đã bỏ voucher";

    private static final Logger logger = LoggerFactory.getLogger(ADPosOrderServiceImpl.class);

    // Lấy danh sách serial theo orderDetailId
    private List<Serial> getSerialsByOrderDetailId(String detailId) {
        return serialRepository.findByOrderDetail_Id(detailId);
    }

    // Đếm số serial theo orderDetailId
    private long countSerialsByOrderDetailId(String detailId) {
        return serialRepository.countByOrderDetail_Id(detailId);
    }

    // Lấy danh sách serial theo orderDetailId và loại trừ serialNumbers
    private List<Serial> getSerialsByOrderDetailIdNotIn(String detailId, List<String> serialNumbers) {
        return serialRepository.findByOrderDetail_IdAndSerialNumberNotIn(detailId, serialNumbers);
    }

    // Tính tổng tiền các OrderDetail
    private BigDecimal calculateOrderTotal(List<OrderDetail> details) {
        return details.stream()
                .map(OrderDetail::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Lấy danh sách serial khả dụng theo productDetailId
    private List<Serial> getAvailableSerialsByProductDetailId(String productDetailId) {
        return serialRepository.findByProductDetailIdAndSerialStatus(productDetailId, SerialStatus.AVAILABLE);
    }

    private final ADPosOrderRepository posOrderRepository;
    private final ADPosOrderDetailRepository posOrderDetailRepository;
    private final SerialRepository serialRepository;
    private final CustomerRepository customerRepository;
    private final ProductDetailRepository productDetailRepository;
    private final ADDiscountDetailRepository adDiscountDetailRepository;
    private final ADVouchersRepository adVouchersRepository;
    private final EmployeeRepository employeeRepository;
    private final OrderHistoryRepository orderHistoryRepository;
    private final VoucherDetailRepository voucherDetailRepository;
    private final ShiftHandoverRepository shiftHandoverRepository;
    private final ADDiscountRepository adDiscountRepository;

    @Override
    @Transactional
    public ResponseObject<?> createEmptyOrder() {
        logger.info("[POS] Yêu cầu tạo hóa đơn trống mới");
        long pendingCount = posOrderRepository.countByOrderStatusAndOrderType(OrderStatus.CHO_XAC_NHAN,
                TypeInvoice.OFFLINE);
        if (pendingCount >= MAX_PENDING_ORDERS) {
            logger.warn("[POS] Đã đạt giới hạn hóa đơn chờ ({} hóa đơn)", pendingCount);
            return ResponseObject.error(HttpStatus.BAD_REQUEST, MSG_MAX_PENDING);
        }
        Order order = new Order();
        order.setOrderStatus(OrderStatus.CHO_XAC_NHAN);
        order.setOrderType(TypeInvoice.OFFLINE);
        order.setTotalAmount(BigDecimal.ZERO);
        order.setTotalAfterDiscount(BigDecimal.ZERO);

        // 1. Lưu tạm Order rỗng xuống DB để MySQL tự sinh ra ID (và Code nếu có trigger)
        order = posOrderRepository.save(order);

        // 2. Đảm bảo mã hóa đơn được thiết lập (nếu DB chưa tự sinh)
        if (order.getCode() == null || order.getCode().isEmpty()) {
            // Cách 1: Sinh mã từ ID (Thường dùng nhất)
            String shortId = order.getId().length() > 6 ? order.getId().substring(0, 6).toUpperCase() : order.getId().toUpperCase();
            order.setCode("HD" + shortId);

            // 3. Cập nhật lại Order với cái Code vừa gán
            order = posOrderRepository.save(order);
        }

        // Gán nhân viên thực hiện bán hàng tại thời điểm tạo hóa đơn
        Employee currentEmployee = getCurrentEmployee();
        order.setEmployee(currentEmployee);

        // Gán ca làm việc hiện tại cho đơn hàng
        if (currentEmployee.getAccount() != null) {
            shiftHandoverRepository.findOpenShiftByAccountId(currentEmployee.getAccount().getId())
                    .ifPresent(order::setShiftHandover);
        }

        // Cập nhật lần cuối
        posOrderRepository.save(order);

        logger.info("[POS] Đã tạo hóa đơn trống thành công, orderId={}, orderCode={}", order.getId(), order.getCode());
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
        logger.info("[POS] Thêm sản phẩm {} (số lượng {}) vào hóa đơn {}", productDetailId, quantity, orderId);
        Order order = posOrderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return ResponseObject.error(HttpStatus.NOT_FOUND, MSG_ORDER_NOT_FOUND + ": " + orderId);
        }

        ProductDetail productDetail = productDetailRepository.findById(productDetailId).orElse(null);
        if (productDetail == null) {
            return ResponseObject.error(HttpStatus.NOT_FOUND, MSG_PRODUCT_NOT_FOUND);
        }

        List<OrderDetail> existingDetails = posOrderDetailRepository.findByOrderId(orderId);

        OrderDetail targetDetail = null;
        for (OrderDetail detail : existingDetails) {
            if (detail.getProductDetail().getId().equals(productDetail.getId())) {
                targetDetail = detail;
                break;
            }
        }

        BigDecimal originalPrice = productDetail.getSalePrice();
        if (originalPrice == null) {
            originalPrice = BigDecimal.ZERO;
        }

        BigDecimal unitPrice = originalPrice;

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
            targetDetail.setOriginalPrice(originalPrice);
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

        // Tính lại tổng tiền từ tất cả chi tiết đơn hàng
        List<OrderDetail> allDetails = posOrderDetailRepository.findByOrderId(orderId);
        BigDecimal newTotal = calculateOrderTotal(allDetails);
        order.setTotalAmount(newTotal);

        // Tự động áp dụng hoặc cập nhật voucher tốt nhất nếu có khách hàng
        Voucher appliedVoucher = autoApplyBestVoucher(order, newTotal);
        boolean voucherChanged = appliedVoucher != order.getVoucher();

        if (voucherChanged) {
            if (appliedVoucher != null) {
                order.setVoucher(appliedVoucher);
                order.setTotalAfterDiscount(calculateTotalAfterVoucher(newTotal, appliedVoucher));
                logger.info("[POS] Đã tự động áp voucher tốt nhất: {} cho đơn {}", appliedVoucher.getCode(), orderId);
            } else {
                order.setVoucher(null);
                order.setTotalAfterDiscount(newTotal);
                logger.info("[POS] Đã gỡ voucher khỏi đơn {} (không còn phù hợp)", orderId);
            }
        } else if (order.getVoucher() != null) {
            // Voucher hiện tại vẫn là tốt nhất, chỉ cập nhật lại totalAfterDiscount
            order.setTotalAfterDiscount(calculateTotalAfterVoucher(newTotal, order.getVoucher()));
        }

        posOrderRepository.save(order);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("orderDetail", targetDetail);
        responseData.put("voucherChanged", voucherChanged);
        responseData.put("appliedVoucher", order.getVoucher() != null ? buildVoucherInfo(order.getVoucher(), newTotal) : null);
        responseData.put("totalAmount", order.getTotalAmount());
        responseData.put("totalAfterDiscount", order.getTotalAfterDiscount());
        return ResponseObject.success(responseData, "Thêm sản phẩm vào hóa đơn thành công");
    }

    @Override
    @Transactional
    public ResponseObject<?> assignSerialsToOrderDetail(String orderId, String detailId, List<String> serialNumbers) {
        logger.info("[POS] Gán serial cho chi tiết hóa đơn {}: {} serial(s), orderId={}", detailId, serialNumbers.size(), orderId);

        // Tìm Order: thử theo database ID trước, nếu không được thì thử theo code (VD: OTH59798424)
        Order order = posOrderRepository.findById(orderId)
                .orElseGet(() -> {
                    logger.info("[POS] Không tìm thấy Order theo ID '{}', thử tìm theo code", orderId);
                    return posOrderRepository.findByCode(orderId).orElse(null);
                });

        if (order == null) {
            logger.warn("[POS] Không tìm thấy Order với ID/code: {}", orderId);
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn");
        }

        OrderDetail detail = posOrderDetailRepository.findById(detailId).orElse(null);
        if (detail == null || !detail.getOrder().getId().equals(order.getId())) {
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy chi tiết hóa đơn");
        }

        if (serialNumbers.size() != detail.getQuantity()) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST,
                    String.format("Số lượng Serial gán (%d) phải bằng số lượng yêu cầu (%d)", serialNumbers.size(),
                            detail.getQuantity()));
        }

        List<Serial> targetSerials = serialRepository.findBySerialNumberIn(serialNumbers);
        if (targetSerials.size() != serialNumbers.size()) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, MSG_SERIAL_NOT_FOUND);
        }

        for (Serial serial : targetSerials) {
            if (!serial.getProductDetail().getId().equals(detail.getProductDetail().getId())) {
                return ResponseObject.error(HttpStatus.BAD_REQUEST,
                        String.format(MSG_SERIAL_NOT_BELONG, serial.getSerialNumber()));
            }
            // Allow AVAILABLE or IN_ORDER-by-this-same-detail
            boolean isAvailable = serial.getSerialStatus() == SerialStatus.AVAILABLE;
            boolean isInOrderBySelf = serial.getSerialStatus() == SerialStatus.IN_ORDER
                    && serial.getOrderDetail() != null
                    && serial.getOrderDetail().getId().equals(detailId);
            if (!isAvailable && !isInOrderBySelf) {
                return ResponseObject.error(HttpStatus.BAD_REQUEST,
                        String.format(MSG_SERIAL_NOT_READY, serial.getSerialNumber()));
            }
        }

        // Release previously assigned serials for this detail (not in new list)
        List<Serial> oldSerials = getSerialsByOrderDetailIdNotIn(detailId, serialNumbers);
        for (Serial old : oldSerials) {
            old.setOrderDetail(null);
            old.setSerialStatus(SerialStatus.AVAILABLE);
        }
        if (!oldSerials.isEmpty()) {
            serialRepository.saveAll(oldSerials);
        }

        for (Serial serial : targetSerials) {
            serial.setOrderDetail(detail);
            serial.setOrderHolding(order); // Quan trọng: set cả orderHolding để đồng bộ
            serial.setSerialStatus(SerialStatus.IN_ORDER);
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

            // TÍNH TOÁN LẠI TỔNG TIỀN CUỐI CÙNG ĐỂ HIỂN THỊ
            BigDecimal subTotal = o.getTotalAfterDiscount() != null ? o.getTotalAfterDiscount() : o.getTotalAmount();
            // FE POS dùng totalAfterDiscount (trước ship) cho "Khách cần trả" + phí ship phía client
            map.put("totalAfterDiscount", subTotal);
            BigDecimal shipping = o.getShippingFee() != null ? o.getShippingFee() : BigDecimal.ZERO;
            BigDecimal finalTotal = subTotal.add(shipping);

            map.put("tongTienSauGiam", finalTotal);

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
            map.put("originalPrice", d.getOriginalPrice() != null ? d.getOriginalPrice() : null);
            map.put("totalPrice", d.getTotalPrice());

            List<Serial> detailSerials = getSerialsByOrderDetailId(d.getId());
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
                // Add original price (snapshot) from order detail entity
                BigDecimal originalPrice = d.getOriginalPrice() != null
                        ? d.getOriginalPrice()
                        : (d.getProductDetail() != null ? d.getProductDetail().getSalePrice() : null);
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

        // Build order-level info (voucher, totals) for frontend state sync
        Map<String, Object> orderMeta = new HashMap<>();
        orderMeta.put("totalAmount", order.getTotalAmount());
        orderMeta.put("totalAfterDiscount", order.getTotalAfterDiscount());
        if (order.getVoucher() != null) {
            Map<String, Object> vMap = new HashMap<>();
            vMap.put("id", order.getVoucher().getId());
            vMap.put("code", order.getVoucher().getCode());
            vMap.put("name", order.getVoucher().getName());
            vMap.put("discountValue", order.getVoucher().getDiscountValue());
            vMap.put("discountUnit", order.getVoucher().getDiscountUnit());
            vMap.put("maxDiscountAmount", order.getVoucher().getMaxDiscountAmount());
            vMap.put("conditions", order.getVoucher().getConditions());
            orderMeta.put("voucher", vMap);
        } else {
            orderMeta.put("voucher", null);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("details", result);
        response.put("order", orderMeta);

        return ResponseObject.success(response, "Lấy chi tiết hóa đơn thành công");
    }

    @Override
    @Transactional
    public ResponseObject<?> removeSerialFromOrderDetail(String orderId, String detailId, String serialNumber) {
        logger.info("[POS] Xóa serial {} khỏi chi tiết hóa đơn {}", serialNumber, detailId);
        Serial serial = serialRepository.findBySerialNumber(serialNumber).orElse(null);
        if (serial == null || serial.getOrderDetail() == null
                || !serial.getOrderDetail().getId().equals(detailId)) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, MSG_SERIAL_NOT_IN_DETAIL);
        }

        serial.setOrderDetail(null);
        serial.setSerialStatus(SerialStatus.AVAILABLE);
        serialRepository.save(serial);

        return ResponseObject.success(null, "Đã Xóa serial " + serialNumber + " khỏi sản phẩm");
    }

    @Override
    @Transactional
    public ResponseObject<?> removeProductFromOrder(String orderId, String detailId) {
        logger.info("[POS] Xóa sản phẩm (detailId={}) khỏi hóa đơn {}", detailId, orderId);
        OrderDetail targetDetail = posOrderDetailRepository.findById(detailId).orElse(null);
        if (targetDetail == null || !targetDetail.getOrder().getId().equals(orderId)) {
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy chi tiết hóa đơn");
        }

        // Free any IN_ORDER serials
        List<Serial> inOrderSerials = getSerialsByOrderDetailId(detailId);
        for (Serial serial : inOrderSerials) {
            serial.setOrderDetail(null);
            serial.setSerialStatus(SerialStatus.AVAILABLE);
        }
        if (!inOrderSerials.isEmpty()) {
            serialRepository.saveAll(inOrderSerials);
        }

        // Update Order total
        Order order = targetDetail.getOrder();
        BigDecimal newTotal = order.getTotalAmount().subtract(targetDetail.getTotalPrice());
        if (newTotal.compareTo(BigDecimal.ZERO) < 0)
            newTotal = BigDecimal.ZERO;
        order.setTotalAmount(newTotal);

        // Tự động áp dụng hoặc cập nhật voucher tốt nhất nếu có khách hàng
        Voucher appliedVoucher = autoApplyBestVoucher(order, newTotal);
        boolean voucherChanged = appliedVoucher != order.getVoucher();

        if (voucherChanged) {
            if (appliedVoucher != null) {
                order.setVoucher(appliedVoucher);
                order.setTotalAfterDiscount(calculateTotalAfterVoucher(newTotal, appliedVoucher));
                logger.info("[POS] Đã cập nhật voucher tốt nhất: {} sau khi xóa sản phẩm", appliedVoucher.getCode());
            } else {
                order.setVoucher(null);
                order.setTotalAfterDiscount(newTotal);
                logger.info("[POS] Đã gỡ voucher khỏi đơn {} (không còn phù hợp sau khi xóa sản phẩm)", orderId);
            }
        } else if (order.getVoucher() != null) {
            order.setTotalAfterDiscount(calculateTotalAfterVoucher(newTotal, order.getVoucher()));
        } else {
            order.setTotalAfterDiscount(newTotal);
        }

        posOrderRepository.save(order);

        posOrderDetailRepository.delete(targetDetail);

        // Trả về thông tin voucher đã được cập nhật tự động
        Map<String, Object> resp = new HashMap<>();
        resp.put("voucherChanged", voucherChanged);
        resp.put("appliedVoucher", order.getVoucher() != null ? buildVoucherInfo(order.getVoucher(), newTotal) : null);
        resp.put("totalAmount", order.getTotalAmount());
        resp.put("totalAfterDiscount", order.getTotalAfterDiscount());
        return ResponseObject.success(resp, "Đã xóa sản phẩm khỏi hóa đơn");
    }

    @Override
    @Transactional
    public ResponseObject<?> setCustomerForOrder(String orderId, String customerId) {
        logger.info("[POS] Gán khách hàng {} vào hóa đơn {}", customerId, orderId);

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

        // Lấy địa chỉ mặc định
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

        // Tự động áp dụng voucher tốt nhất cho khách hàng
        Voucher bestVoucher = findBestApplicableVoucher(order.getTotalAmount(), customerId);
        if (bestVoucher != null) {
            order.setVoucher(bestVoucher);
            order.setTotalAfterDiscount(calculateTotalAfterVoucher(order.getTotalAmount(), bestVoucher));
            logger.info("[POS] Đã tự động áp dụng voucher tốt nhất: {} (id={}) cho khách hàng {}",
                    bestVoucher.getCode(), bestVoucher.getId(), customerId);
        }

        posOrderRepository.save(order);

        // Trả về thêm thông tin voucher đã áp dụng (nếu có)
        Map<String, Object> resp = new HashMap<>();
        resp.put("orderId", order.getId());
        resp.put("customerId", customerId);
        resp.put("totalAfterDiscount", order.getTotalAfterDiscount());
        resp.put("appliedVoucher", bestVoucher != null ? buildVoucherInfo(bestVoucher, order.getTotalAmount()) : null);
        return ResponseObject.success(resp, "Đã gắn khách hàng vào hóa đơn và tự động áp dụng voucher tốt nhất");
    }

    /**
     * Tự động tìm và áp dụng voucher tốt nhất cho đơn hàng.
     * Hỗ trợ cả khách hàng đã đăng ký lẫn khách vãng lai.
     * - Khách hàng đã đăng ký: tìm voucher INDIVIDUAL + ALL tốt nhất.
     * - Khách vãng lai (không có khách hàng): tìm voucher ALL tốt nhất.
     * Trả về voucher được áp (có thể null). KHÔNG tự động save order.
     */
    private Voucher autoApplyBestVoucher(Order order, BigDecimal newTotal) {
        if (newTotal == null || newTotal.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }
        if (order.getCustomer() != null) {
            // Khách hàng đã đăng ký: tìm voucher INDIVIDUAL + ALL tốt nhất
            String customerId = order.getCustomer().getId();
            return findBestApplicableVoucher(newTotal, customerId);
        } else {
            // Khách vãng lai: chỉ tìm voucher ALL
            return findBestVoucherForWalkInCustomer(newTotal);
        }
    }

    /**
     * Tìm voucher ALL tốt nhất cho khách vãng lai.
     * Ưu tiên voucher chung (ALL), so sánh số tiền được giảm, chọn voucher giảm được nhiều nhất.
     */
    private Voucher findBestVoucherForWalkInCustomer(BigDecimal orderTotal) {
        if (orderTotal == null || orderTotal.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }
        long now = System.currentTimeMillis();
        List<Voucher> candidates = adVouchersRepository.findAll().stream()
                .filter(v -> v.getStatus() != null && (v.getStatus() == 1 || v.getStatus() == 2)
                        && v.getQuantity() != null && v.getQuantity() > 0
                        && v.getStartDate() != null && v.getStartDate() <= now
                        && v.getEndDate() != null && v.getEndDate() >= now
                        && (v.getConditions() == null || v.getConditions().compareTo(orderTotal) <= 0))
                // Khách vãng lai: chỉ xét voucher ALL
                .filter(v -> !"INDIVIDUAL".equalsIgnoreCase(v.getVoucherType()))
                .collect(Collectors.toList());

        Voucher best = null;
        BigDecimal bestSaving = BigDecimal.ZERO;
        for (Voucher v : candidates) {
            BigDecimal saving = calculateVoucherSaving(orderTotal, v);
            if (saving.compareTo(bestSaving) > 0) {
                bestSaving = saving;
                best = v;
            }
        }
        return best;
    }

    /**
     * Build a minimal info map for a voucher (avoids serializing entire entity with lazy loads).
     * @param v the voucher
     * @param orderTotal the actual order total (used to calculate estimatedSaving accurately)
     */
    private Map<String, Object> buildVoucherInfo(Voucher v, BigDecimal orderTotal) {
        Map<String, Object> info = new HashMap<>();
        info.put("id", v.getId());
        info.put("code", v.getCode());
        info.put("name", v.getName());
        info.put("discountUnit", v.getDiscountUnit());
        info.put("discountValue", v.getDiscountValue());
        info.put("maxDiscountAmount", v.getMaxDiscountAmount());
        info.put("conditions", v.getConditions());
        BigDecimal saving = calculateVoucherSaving(orderTotal, v);
        info.put("estimatedSaving", saving);
        return info;
    }

    /**
     * Tìm voucher tốt nhất cho khách hàng dựa trên tổng tiền đơn hàng.
     * Ưu tiên: voucher cá nhân (INDIVIDUAL) của khách + tất cả voucher chung (ALL),
     * so sánh số tiền được giảm, chọn voucher giảm được nhiều nhất.
     */
    private Voucher findBestApplicableVoucher(java.math.BigDecimal orderTotal, String customerId) {
        if (orderTotal == null || orderTotal.compareTo(java.math.BigDecimal.ZERO) <= 0) {
            return null;
        }
        long now = System.currentTimeMillis();
        List<Voucher> candidates = adVouchersRepository.findAll().stream()
                .filter(v -> v.getStatus() != null && (v.getStatus() == 1 || v.getStatus() == 2)
                        && v.getQuantity() != null && v.getQuantity() > 0
                        && v.getStartDate() != null && v.getStartDate() <= now
                        && v.getEndDate() != null && v.getEndDate() >= now
                        && (v.getConditions() == null || v.getConditions().compareTo(orderTotal) <= 0))
                .filter(v -> {
                    if ("INDIVIDUAL".equalsIgnoreCase(v.getVoucherType())) {
                        if (v.getDetails() == null) return false;
                        return v.getDetails().stream()
                                .anyMatch(d -> d.getCustomer() != null
                                        && d.getCustomer().getId().equals(customerId)
                                        && d.getUsageStatus() != null
                                        && d.getUsageStatus() == 0);
                    }
                    return true; // Voucher ALL luôn là ứng viên
                })
                .collect(Collectors.toList());

        Voucher best = null;
        java.math.BigDecimal bestSaving = java.math.BigDecimal.ZERO;
        for (Voucher v : candidates) {
            java.math.BigDecimal saving = calculateVoucherSaving(orderTotal, v);
            if (saving.compareTo(bestSaving) > 0) {
                bestSaving = saving;
                best = v;
            }
        }
        return best;
    }

    /**
     * Tính số tiền được giảm bởi một voucher.
     */
    private java.math.BigDecimal calculateVoucherSaving(java.math.BigDecimal total, Voucher voucher) {
        if (voucher == null) return java.math.BigDecimal.ZERO;
        String unit = voucher.getDiscountUnit() != null ? voucher.getDiscountUnit().trim().toUpperCase() : "";
        java.math.BigDecimal saving = java.math.BigDecimal.ZERO;
        if ("%".equals(unit) || "PERCENT".equals(unit)) {
            saving = total.multiply(voucher.getDiscountValue()).divide(new java.math.BigDecimal("100"));
            if (voucher.getMaxDiscountAmount() != null && saving.compareTo(voucher.getMaxDiscountAmount()) > 0) {
                saving = voucher.getMaxDiscountAmount();
            }
        } else {
            saving = voucher.getDiscountValue() != null ? voucher.getDiscountValue() : java.math.BigDecimal.ZERO;
        }
        return saving;
    }

    @Override
    @Transactional
    public ResponseObject<?> checkoutOrder(String orderId,
            com.example.datn.core.admin.pos.model.request.CheckoutPosRequest request) {
        logger.info("[POS] Thanh toán hóa đơn {}", orderId);
        Order order = posOrderRepository.findById(orderId).orElse(null);
        if (order == null)
            return ResponseObject.error(HttpStatus.NOT_FOUND, MSG_ORDER_NOT_FOUND);
        if (order.getOrderStatus() != OrderStatus.CHO_XAC_NHAN) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Hóa đơn này không ở trạng thái chờ thanh toán");
        }

        // Xác định loại đơn hàng
        TypeInvoice orderType = TypeInvoice.OFFLINE;
        if (request != null && "GIAO_HANG".equals(request.getOrderType())) {
            orderType = TypeInvoice.GIAO_HANG;
        }
        order.setOrderType(orderType);

        // Xác định phương thức thanh toán
        String paymentMethod = (request != null && request.getPaymentMethod() != null)
                ? request.getPaymentMethod()
                : PAYMENT_METHOD_CASH;
        order.setPaymentMethod(paymentMethod);

        // Cập nhật thông tin giao hàng
        if (orderType == TypeInvoice.GIAO_HANG && request != null) {
            if (request.getRecipientName() != null)
                order.setRecipientName(request.getRecipientName());
            if (request.getRecipientPhone() != null)
                order.setRecipientPhone(request.getRecipientPhone());
            if (request.getRecipientEmail() != null)
                order.setRecipientEmail(request.getRecipientEmail());
            if (request.getRecipientAddress() != null)
                order.setRecipientAddress(request.getRecipientAddress());
            BigDecimal shippingFee = request.getShippingFee() != null ? request.getShippingFee() : BigDecimal.ZERO;
            order.setShippingFee(shippingFee);
        } else {
            order.setShippingFee(BigDecimal.ZERO);
        }

        // Ghi nhận số tiền khách đưa
        if (request != null && request.getCustomerPaid() != null) {
            order.setCustomerPaid(request.getCustomerPaid());
        }

        // Gán lại ca làm việc hiện tại cho đơn hàng
        Employee currentEmployee = getCurrentEmployee();
        if (currentEmployee.getAccount() != null) {
            Optional<ShiftHandover> openShift = shiftHandoverRepository.findOpenShiftByAccountId(currentEmployee.getAccount().getId());

            if (openShift.isPresent()) {
                order.setShiftHandover(openShift.get());
                logger.info("[POS] Đã gán thành công hóa đơn {} vào ca làm việc {}", order.getCode(), openShift.get().getId());
            } else {
                logger.error("[POS] LỖI: Không tìm thấy ca trực OPEN nào của tài khoản {}", currentEmployee.getAccount().getUsername());
            }
        } else {
            logger.error("[POS] LỖI: Nhân viên {} không được liên kết với tài khoản nào!", currentEmployee.getName());
        }
        // Update Order status
        // GIAO_HANG: đã xác nhận + đã thanh toán nhưng chưa giao → DA_XAC_NHAN
        // OFFLINE: khách lấy hàng ngay tại quầy → HOAN_THANH
        if (orderType == TypeInvoice.GIAO_HANG) {
            order.setOrderStatus(OrderStatus.DA_XAC_NHAN);
        } else {
            order.setOrderStatus(OrderStatus.HOAN_THANH);
        }
        order.setPaymentDate(new Date().getTime());
        // Gán trạng thái thanh toán
        order.setPaymentStatus(PaymentStatus.DA_THANH_TOAN);

        List<OrderDetail> details = posOrderDetailRepository.findByOrderId(orderId);
        if (details.isEmpty()) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, MSG_ORDER_EMPTY);
        }

        // Validate all details have correct number of assigned serials
        boolean isMissingSerials = false;
        for (OrderDetail detail : details) {
            long assignedSerialsCount = countSerialsByOrderDetailId(detail.getId());
            if (assignedSerialsCount != detail.getQuantity()) {
                isMissingSerials = true;
                break;
            }
        }
        if (isMissingSerials) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, MSG_SERIAL_NOT_ENOUGH);
        }

        // For each detail, find the associated serials and generate warranty
        for (OrderDetail detail : details) {
            ProductDetail productDetail = detail.getProductDetail();
            int newQuantity = productDetail.getQuantity() - detail.getQuantity();
            if (newQuantity < 0)
                newQuantity = 0;
            productDetail.setQuantity(newQuantity);
            productDetailRepository.save(productDetail);

            Optional<DiscountDetail> activeDiscountDetail = adDiscountDetailRepository
                    .findActiveByProductDetailId(productDetail.getId(), System.currentTimeMillis());

            if (activeDiscountDetail.isPresent()) {
                DiscountDetail dd = activeDiscountDetail.get();
                Discount parentDiscount = dd.getDiscount(); // Lấy thực thể cha (Discount)

                // Kiểm tra xem chương trình giảm giá có quản lý số lượng không
                if (parentDiscount != null && parentDiscount.getQuantity() != null) {
                    if (parentDiscount.getQuantity() > 0) {
                        int remainDiscountQty = parentDiscount.getQuantity() - detail.getQuantity();
                        if (remainDiscountQty < 0)
                            remainDiscountQty = 0;

                        parentDiscount.setQuantity(remainDiscountQty);

                        adDiscountRepository.save(parentDiscount);

                        logger.info("[POS] Đã trừ số lượng CT giảm giá: {}, Còn lại: {}",
                                parentDiscount.getCode(), remainDiscountQty);
                    }
                }
            }
            List<Serial> assignedSerials = getSerialsByOrderDetailId(detail.getId());
            for (Serial serial : assignedSerials) {
                // Update Serial status
                serial.setSerialStatus(SerialStatus.SOLD);
                serial.setStatus(com.example.datn.infrastructure.constant.EntityStatus.INACTIVE);
                serialRepository.save(serial);
            }
        }

        posOrderRepository.save(order);

        // Voucher: giảm số lượng và đánh dấu INDIVIDUAL đã sử dụng khi thanh toán thành
        // công
        if (order.getVoucher() != null) {
            Voucher posVoucher = order.getVoucher();
            if (posVoucher.getQuantity() != null && posVoucher.getQuantity() > 0) {
                posVoucher.setQuantity(posVoucher.getQuantity() - 1);
                adVouchersRepository.save(posVoucher);
            }
            if ("INDIVIDUAL".equals(posVoucher.getVoucherType()) && order.getCustomer() != null) {
                voucherDetailRepository
                        .findUnusedByVoucherAndCustomer(posVoucher.getId(), order.getCustomer().getId())
                        .ifPresent(vd -> {
                            vd.setUsageStatus(1);
                            vd.setUsedDate(System.currentTimeMillis());
                            vd.setOrder(order);
                            voucherDetailRepository.save(vd);
                        });
            }
        }

        // Record checkout history
        OrderHistory lichSu = new OrderHistory();
        lichSu.setOrder(order);
        lichSu.setTrangThai(order.getOrderStatus());
        lichSu.setThoiGian(LocalDateTime.now());
        lichSu.setNote(orderType == TypeInvoice.GIAO_HANG
                ? "Xác nhận đơn giao hàng tại quầy, đã thanh toán"
                : "Thanh toán tại quầy");
        lichSu.setNhanVien(getCurrentEmployee());
        orderHistoryRepository.save(lichSu);

        return ResponseObject.success(order, "Thanh toán thành công");
    }

    @Override
    @Transactional
    public ResponseObject<?> cancelOrder(String orderId) {
        logger.info("[POS] Hủy hóa đơn {}", orderId);
        Order order = posOrderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return ResponseObject.error(HttpStatus.NOT_FOUND, MSG_ORDER_NOT_FOUND);
        }
        if (order.getOrderStatus() != OrderStatus.CHO_XAC_NHAN) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Chỉ có thể hủy/xóa hóa đơn ở trạng thái CHỜ");
        }

        List<OrderDetail> details = posOrderDetailRepository.findByOrderId(orderId);
        for (OrderDetail detail : details) {
            List<Serial> inOrderSerials = getSerialsByOrderDetailId(detail.getId());
            for (Serial serial : inOrderSerials) {
                serial.setOrderDetail(null);
                serial.setOrderHolding(null);
                serial.setSerialStatus(SerialStatus.AVAILABLE);
            }
            if (!inOrderSerials.isEmpty()) {
                serialRepository.saveAll(inOrderSerials);
            }
            posOrderDetailRepository.delete(detail);
        }

        posOrderRepository.delete(order);
        return ResponseObject.success(null, MSG_ORDER_CANCEL_SUCCESS);
    }

    @Override
    public ResponseObject<?> getAvailableSerials(String productDetailId) {
        if (productDetailId == null || productDetailId.isBlank()) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Mã sản phẩm chi tiết không được để trống");
        }
        List<Serial> availableSerials = getAvailableSerialsByProductDetailId(productDetailId);

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
    public ResponseObject<?> getApplicableVouchers(java.math.BigDecimal orderTotal, String customerId) {
        long now = System.currentTimeMillis();
        List<VoucherResponse> applicable = adVouchersRepository.findAll().stream()
                .filter(v -> v.getStatus() != null && (v.getStatus() == 1 || v.getStatus() == 2)
                        && v.getQuantity() != null && v.getQuantity() > 0
                        && v.getStartDate() != null && v.getStartDate() <= now
                        && v.getEndDate() != null && v.getEndDate() >= now
                        && (v.getConditions() == null || v.getConditions().compareTo(orderTotal) <= 0))
                .filter(v -> {
                    // Nếu có customerId → chỉ hiển thị voucher ALL, hoặc INDIVIDUAL mà khách hàng nằm trong danh sách
                    if (customerId != null && !"INDIVIDUAL".equalsIgnoreCase(v.getVoucherType())) {
                        return true; // Voucher công khai luôn hiển thị
                    }
                    if (customerId != null && "INDIVIDUAL".equalsIgnoreCase(v.getVoucherType())) {
                        // Kiểm tra khách hàng có nằm trong danh sách voucher cá nhân không
                        if (v.getDetails() != null) {
                            return v.getDetails().stream()
                                    .anyMatch(d -> d.getCustomer() != null
                                            && d.getCustomer().getId().equals(customerId)
                                            && d.getUsageStatus() != null
                                            && d.getUsageStatus() == 0); // Chưa sử dụng
                        }
                        return false;
                    }
                    // Không có customerId → chỉ hiển thị voucher ALL (INDIVIDUAL ẩn đi)
                    return !"INDIVIDUAL".equalsIgnoreCase(v.getVoucherType());
                })
                .map(VoucherResponse::new)
                .collect(Collectors.toList());

        return ResponseObject.success(applicable, "Lấy danh sách voucher áp dụng được");
    }

    @Override
    @Transactional
    public ResponseObject<?> applyVoucher(String orderId, String voucherId) {
        Order order = posOrderRepository.findById(orderId).orElse(null);
        if (order == null)
            return ResponseObject.error(HttpStatus.NOT_FOUND, MSG_ORDER_NOT_FOUND);
        Voucher voucher = adVouchersRepository.findById(voucherId).orElse(null);
        if (voucher == null)
            return ResponseObject.error(HttpStatus.NOT_FOUND, MSG_VOUCHER_NOT_FOUND);
        if (voucher.getConditions() != null && order.getTotalAmount().compareTo(voucher.getConditions()) < 0) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST,
                    String.format(MSG_VOUCHER_CONDITION, voucher.getConditions().toPlainString()));
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
            return ResponseObject.error(HttpStatus.NOT_FOUND, MSG_ORDER_NOT_FOUND);
        order.setVoucher(null);
        order.setTotalAfterDiscount(order.getTotalAmount());
        posOrderRepository.save(order);
        return ResponseObject.success(null, MSG_REMOVE_VOUCHER);
    }

    @Override
    @Transactional
    public ResponseObject<?> createVnPayUrl(String orderId,
            com.example.datn.core.admin.pos.model.request.CheckoutPosRequest body,
            jakarta.servlet.http.HttpServletRequest request) {
        Order order = posOrderRepository.findById(orderId).orElse(null);
        if (order == null)
            return ResponseObject.error(HttpStatus.NOT_FOUND, MSG_ORDER_NOT_FOUND);
        if (order.getOrderStatus() != OrderStatus.CHO_XAC_NHAN)
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Hóa đơn không ở trạng thái có thể thanh toán");

        List<OrderDetail> details = posOrderDetailRepository.findByOrderId(orderId);
        if (details.isEmpty())
            return ResponseObject.error(HttpStatus.BAD_REQUEST, MSG_ORDER_EMPTY);

        // Validate serials
        for (OrderDetail detail : details) {
            long assignedCount = countSerialsByOrderDetailId(detail.getId());
            if (assignedCount != detail.getQuantity())
                return ResponseObject.error(HttpStatus.BAD_REQUEST, MSG_SERIAL_NOT_ENOUGH);
        }

        // Lưu orderType và thông tin giao hàng vào order trước khi redirect VNPay
        TypeInvoice orderType = TypeInvoice.OFFLINE;
        if (body != null && "GIAO_HANG".equals(body.getOrderType())) {
            orderType = TypeInvoice.GIAO_HANG;
        }
        order.setOrderType(orderType);

        if (orderType == TypeInvoice.GIAO_HANG && body != null) {
            if (body.getRecipientName() != null)
                order.setRecipientName(body.getRecipientName());
            if (body.getRecipientPhone() != null)
                order.setRecipientPhone(body.getRecipientPhone());
            if (body.getRecipientEmail() != null)
                order.setRecipientEmail(body.getRecipientEmail());
            if (body.getRecipientAddress() != null)
                order.setRecipientAddress(body.getRecipientAddress());
            BigDecimal fee = body.getShippingFee() != null ? body.getShippingFee() : BigDecimal.ZERO;
            order.setShippingFee(fee);
        } else {
            order.setShippingFee(BigDecimal.ZERO);
        }

        // Tính tổng tiền (bao gồm phí ship nếu có)
        BigDecimal totalAfterDiscount = order.getTotalAfterDiscount() != null ? order.getTotalAfterDiscount()
                : order.getTotalAmount();
        BigDecimal shippingFee = order.getShippingFee() != null ? order.getShippingFee() : BigDecimal.ZERO;
        long totalToPay = totalAfterDiscount.add(shippingFee).longValue();

        // Cập nhật trạng thái order
        order.setPaymentMethod("CHUYEN_KHOAN");
        order.setPaymentStatus(PaymentStatus.CHO_THANH_TOAN_VNPAY);
        posOrderRepository.save(order);

        String posReturnUrl = vnPayConfig.getPosReturnUrl();
        String paymentUrl = vnPayService.createPaymentUrl(
                orderId,
                totalToPay,
                "Thanh toan POS " + order.getCode(),
                request,
                posReturnUrl);

        Map<String, Object> result = new HashMap<>();
        result.put("paymentUrl", paymentUrl);
        result.put("orderCode", order.getCode());
        result.put("totalAmount", totalToPay);
        return ResponseObject.success(result, "Tạo link thanh toán VNPay thành công");
    }

    @Override
    @Transactional
    public ResponseObject<?> handlePosVnPayReturn(java.util.Map<String, String> params) {
        if (!vnPayService.verifyReturn(params))
            throw new RuntimeException("Chữ ký VNPay không hợp lệ!");

        String orderId = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String transactionNo = params.get("vnp_TransactionNo");
        String amountStr = params.get("vnp_Amount");

        Order order = posOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + orderId));

        // Idempotency: nếu đơn đã được xử lý rồi thì bỏ qua (VNPay gọi lại lần 2)
        if (order.getOrderStatus() == OrderStatus.HOAN_THANH
                || order.getOrderStatus() == OrderStatus.DA_XAC_NHAN) {
            return ResponseObject.success(null, "Thanh toán thành công");
        }

        BigDecimal amount = amountStr != null
                ? new BigDecimal(amountStr).divide(BigDecimal.valueOf(100))
                : (order.getTotalAfterDiscount() != null ? order.getTotalAfterDiscount() : order.getTotalAmount());

        if ("00".equals(responseCode)) {
            // Hoàn thành checkout POS
            List<OrderDetail> details = posOrderDetailRepository.findByOrderId(orderId);
            for (OrderDetail detail : details) {
                ProductDetail productDetail = detail.getProductDetail();
                int newQuantity = productDetail.getQuantity() - detail.getQuantity();
                if (newQuantity < 0)
                    newQuantity = 0;
                productDetail.setQuantity(newQuantity);
                productDetailRepository.save(productDetail);

                Optional<DiscountDetail> activeDiscountDetail = adDiscountDetailRepository
                        .findActiveByProductDetailId(productDetail.getId(), System.currentTimeMillis());

                if (activeDiscountDetail.isPresent()) {
                    DiscountDetail dd = activeDiscountDetail.get();
                    Discount parentDiscount = dd.getDiscount(); // Lấy thực thể cha (Discount)

                    // Kiểm tra xem chương trình giảm giá có quản lý số lượng không
                    if (parentDiscount != null && parentDiscount.getQuantity() != null) {
                        if (parentDiscount.getQuantity() > 0) {
                            int remainDiscountQty = parentDiscount.getQuantity() - detail.getQuantity();
                            if (remainDiscountQty < 0)
                                remainDiscountQty = 0;

                            parentDiscount.setQuantity(remainDiscountQty);

                            adDiscountRepository.save(parentDiscount);

                            logger.info("[POS] Đã trừ số lượng CT giảm giá: {}, Còn lại: {}",
                                    parentDiscount.getCode(), remainDiscountQty);
                        }
                    }
                }

                List<Serial> assignedSerials = getSerialsByOrderDetailId(detail.getId());
                for (Serial serial : assignedSerials) {
                    serial.setSerialStatus(SerialStatus.SOLD);
                    serial.setStatus(com.example.datn.infrastructure.constant.EntityStatus.INACTIVE);
                    serialRepository.save(serial);
                }
            }

            // GIAO_HANG → DA_XAC_NHAN (cần giao hàng tiếp), OFFLINE → HOAN_THANH
            OrderStatus finalStatus = order.getOrderType() == TypeInvoice.GIAO_HANG
                    ? OrderStatus.DA_XAC_NHAN
                    : OrderStatus.HOAN_THANH;
            order.setOrderStatus(finalStatus);
            order.setPaymentStatus(PaymentStatus.DA_THANH_TOAN);
            order.setPaymentDate(System.currentTimeMillis());
            order.setCustomerPaid(amount);
            posOrderRepository.save(order);

            // Voucher: giảm số lượng và đánh dấu INDIVIDUAL đã sử dụng khi VNPay thành công
            if (order.getVoucher() != null) {
                Voucher posVoucher = order.getVoucher();
                if (posVoucher.getQuantity() != null && posVoucher.getQuantity() > 0) {
                    posVoucher.setQuantity(posVoucher.getQuantity() - 1);
                    adVouchersRepository.save(posVoucher);
                }
                if ("INDIVIDUAL".equals(posVoucher.getVoucherType()) && order.getCustomer() != null) {
                    voucherDetailRepository
                            .findUnusedByVoucherAndCustomer(posVoucher.getId(), order.getCustomer().getId())
                            .ifPresent(vd -> {
                                vd.setUsageStatus(1);
                                vd.setUsedDate(System.currentTimeMillis());
                                vd.setOrder(order);
                                voucherDetailRepository.save(vd);
                            });
                }
            }

            OrderHistory lichSu = new OrderHistory();
            lichSu.setOrder(order);
            lichSu.setTrangThai(finalStatus);
            lichSu.setThoiGian(LocalDateTime.now());
            lichSu.setNote(order.getOrderType() == TypeInvoice.GIAO_HANG
                    ? "Xác nhận đơn giao hàng qua VNPay POS, mã GD: " + transactionNo
                    : "Thanh toán tại quầy qua VNPay, mã GD: " + transactionNo);
            lichSu.setNhanVien(getCurrentEmployee());
            orderHistoryRepository.save(lichSu);
        } else {
            order.setPaymentStatus(PaymentStatus.THANH_TOAN_THAT_BAI);
            order.setOrderStatus(OrderStatus.CHO_XAC_NHAN);
            posOrderRepository.save(order);
        }

        return ResponseObject.success(null,
                "00".equals(responseCode) ? "Thanh toán thành công" : "Thanh toán thất bại");
    }

    @Override
    @Transactional
    public ResponseObject<?> removeCustomerFromOrder(String orderId) {
        logger.info("[POS] Gỡ khách hàng khỏi hóa đơn {}", orderId);

        Order order = posOrderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return ResponseObject.error(HttpStatus.NOT_FOUND, MSG_ORDER_NOT_FOUND);
        }

        // Gỡ khách hàng
        order.setCustomer(null);

        // Gỡ voucher (nếu có) vì voucher thường đi kèm theo khách hàng
        order.setVoucher(null);

        // Tính toán lại tiền (trả về giá trị gốc do không còn voucher)
        order.setTotalAfterDiscount(order.getTotalAmount());

        posOrderRepository.save(order);

        return ResponseObject.success(null, "Đã bỏ chọn khách hàng");
    }

    // Lazy-injected to avoid circular dependency
    @org.springframework.context.annotation.Lazy
    @org.springframework.beans.factory.annotation.Autowired
    private VNPayService vnPayService;

    @org.springframework.beans.factory.annotation.Autowired
    private VNPayConfig vnPayConfig;
}
