package com.example.datn.core.client.order.service.impl;

import com.example.datn.core.admin.order.repository.ADOrderDetailRepository;
import com.example.datn.core.client.cart.model.AddToCartRequest;
import com.example.datn.core.client.cart.service.CartService;
import com.example.datn.core.client.cartDetail.repository.CnCartDetailRepository;
import com.example.datn.core.client.cartDetail.service.CnCartDetailService;
import com.example.datn.core.client.order.model.response.*;
import com.example.datn.core.client.order.repository.CnOrderRepository;
import com.example.datn.core.client.order.service.CnCustomerOrderService;
import com.example.datn.entity.*;
import com.example.datn.infrastructure.constant.OrderStatus;
import com.example.datn.infrastructure.constant.PaymentStatus;
import com.example.datn.infrastructure.constant.SerialStatus;
import com.example.datn.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CnCustomerOrderServiceImpl implements CnCustomerOrderService {

    private final CnOrderRepository orderRepository;
    private final ADOrderDetailRepository orderDetailRepository;
    private final OrderHistoryRepository orderHistoryRepository;
    private final CartService cartService;
    private final CnCartDetailRepository cartDetailRepository;
    private final CnCartDetailService cartDetailService;
    private final SerialRepository serialRepository;
    private final VoucherDetailRepository voucherDetailRepository;
    private final VoucherRepository voucherRepository;
    private final PaymentHistoryRepository paymentHistoryRepository;

    private static final Map<OrderStatus, String> ORDER_STATUS_LABELS = Map.ofEntries(
            Map.entry(OrderStatus.CHO_XAC_NHAN, "Chờ xác nhận"),
            Map.entry(OrderStatus.DA_XAC_NHAN, "Đã xác nhận"),
            Map.entry(OrderStatus.CHO_GIAO, "Chờ giao hàng"),
            Map.entry(OrderStatus.DANG_GIAO, "Đang giao hàng"),
            Map.entry(OrderStatus.HOAN_THANH, "Hoàn thành"),
            Map.entry(OrderStatus.DA_HUY, "Đã hủy"),
            Map.entry(OrderStatus.LUU_TAM, "Lưu tạm")
    );

    private static final Map<PaymentStatus, String> PAYMENT_STATUS_LABELS = Map.ofEntries(
            Map.entry(PaymentStatus.CHUA_THANH_TOAN, "Chưa thanh toán"),
            Map.entry(PaymentStatus.CHO_THANH_TOAN_VNPAY, "Chờ thanh toán VNPay"),
            Map.entry(PaymentStatus.DA_THANH_TOAN, "Đã thanh toán"),
            Map.entry(PaymentStatus.THANH_TOAN_MOT_PHAN, "Thanh toán một phần"),
            Map.entry(PaymentStatus.THANH_TOAN_THAT_BAI, "Thanh toán thất bại")
    );

    private static final Map<String, String> PAYMENT_METHOD_LABELS = Map.ofEntries(
            Map.entry("COD", "Thanh toán khi nhận hàng (COD)"),
            Map.entry("VNPAY", "Thanh toán qua VNPay"),
            Map.entry("TIEN_MAT", "Tiền mặt"),
            Map.entry("CHUYEN_KHOAN", "Chuyển khoản")
    );

    private static final Set<OrderStatus> CANCELABLE_STATUSES = Set.of(
            OrderStatus.CHO_XAC_NHAN,
            OrderStatus.DA_XAC_NHAN
    );

    private static final Set<OrderStatus> BUY_AGAIN_ALLOWED_STATUSES = Set.of(
            OrderStatus.HOAN_THANH
    );

    // ===== ORDER LIST =====

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerOrderListResponse> getOrderList(String customerId, String status, Pageable pageable) {
        Page<Order> orders;

        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("all")) {
            try {
                OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
                orders = orderRepository.findByCustomerIdAndStatus(customerId, orderStatus, pageable);
            } catch (IllegalArgumentException e) {
                orders = orderRepository.findByCustomerId(customerId, pageable);
            }
        } else {
            orders = orderRepository.findByCustomerId(customerId, pageable);
        }

        return orders.map(this::toListResponse);
    }

    private CustomerOrderListResponse toListResponse(Order order) {
        List<OrderDetail> details = orderDetailRepository.findByOrderId(order.getId());

        List<CustomerOrderListResponse.OrderItemPreview> previews = details.stream()
                .limit(3)
                .map(d -> toItemPreview(d.getProductDetail(), d.getQuantity()))
                .collect(Collectors.toList());

        int totalQty = details.stream()
                .mapToInt(d -> d.getQuantity() != null ? d.getQuantity() : 0)
                .sum();

        BigDecimal campaignDiscount = BigDecimal.ZERO;
        BigDecimal voucherDiscount = BigDecimal.ZERO;

        if (order.getTotalAmount() != null && order.getTotalAfterDiscount() != null) {
            BigDecimal rawDiscount = order.getTotalAmount().subtract(order.getTotalAfterDiscount());
            if (rawDiscount.compareTo(BigDecimal.ZERO) > 0) {
                voucherDiscount = rawDiscount;
            }
        }

        return CustomerOrderListResponse.builder()
                .id(order.getId())
                .code(order.getCode())
                .createdDate(order.getCreatedDate())
                .orderStatus(order.getOrderStatus() != null ? order.getOrderStatus().name() : null)
                .orderStatusLabel(labelOrderStatus(order.getOrderStatus()))
                .paymentStatus(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : null)
                .paymentStatusLabel(labelPaymentStatus(order.getPaymentStatus()))
                .paymentMethod(order.getPaymentMethod())
                .paymentMethodLabel(labelPaymentMethod(order.getPaymentMethod()))
                .totalAmount(order.getTotalAmount())
                .totalAfterDiscount(order.getTotalAfterDiscount())
                .shippingFee(order.getShippingFee())
                .campaignDiscount(campaignDiscount)
                .voucherDiscount(voucherDiscount)
                .voucherCode(order.getVoucher() != null ? order.getVoucher().getCode() : null)
                .itemCount(totalQty)
                .itemPreviews(previews)
                .build();
    }

    // ===== ORDER DETAIL =====

    @Override
    @Transactional(readOnly = true)
    public CustomerOrderDetailResponse getOrderDetail(String customerId, String orderId) {
        Order order = orderRepository.findByIdWithHistories(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!customerId.equals(order.getCustomer().getId())) {
            throw new RuntimeException("Không tìm thấy đơn hàng");
        }

        return toDetailResponse(order);
    }

    private CustomerOrderDetailResponse toDetailResponse(Order order) {
        List<OrderDetail> details = orderDetailRepository.findByOrderId(order.getId());

        List<CustomerOrderItemResponse> items = details.stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList());

        List<OrderHistory> histories = orderHistoryRepository.findByHoaDonOrderByThoiGianAsc(order);
        List<CustomerOrderHistoryResponse> timeline = toTimeline(histories, order.getOrderStatus());

        BigDecimal campaignDiscount = BigDecimal.ZERO;
        BigDecimal voucherDiscount = BigDecimal.ZERO;

        if (order.getTotalAmount() != null && order.getTotalAfterDiscount() != null) {
            BigDecimal rawDiscount = order.getTotalAmount().subtract(order.getTotalAfterDiscount());
            if (rawDiscount.compareTo(BigDecimal.ZERO) > 0) {
                voucherDiscount = rawDiscount;
            }
        }

        OrderStatus currentStatus = order.getOrderStatus();
        boolean canCancel = currentStatus != null && CANCELABLE_STATUSES.contains(currentStatus);
        boolean canConfirmReceived = currentStatus == OrderStatus.DANG_GIAO;
        boolean canBuyAgain = currentStatus != null && BUY_AGAIN_ALLOWED_STATUSES.contains(currentStatus);

        return CustomerOrderDetailResponse.builder()
                .id(order.getId())
                .code(order.getCode())
                .createdDate(order.getCreatedDate())
                .paymentDate(order.getPaymentDate())
                .orderStatus(currentStatus != null ? currentStatus.name() : null)
                .orderStatusLabel(labelOrderStatus(currentStatus))
                .paymentStatus(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : null)
                .paymentStatusLabel(labelPaymentStatus(order.getPaymentStatus()))
                .paymentMethod(order.getPaymentMethod())
                .paymentMethodLabel(labelPaymentMethod(order.getPaymentMethod()))
                .recipientName(order.getRecipientName())
                .recipientPhone(order.getRecipientPhone())
                .recipientEmail(order.getRecipientEmail())
                .recipientAddress(order.getRecipientAddress())
                .shippingMethodName(order.getShippingMethod() != null ? order.getShippingMethod().getName() : null)
                .totalAmount(order.getTotalAmount())
                .campaignDiscount(campaignDiscount)
                .voucherDiscount(voucherDiscount)
                .voucherCode(order.getVoucher() != null ? order.getVoucher().getCode() : null)
                .voucherName(order.getVoucher() != null ? order.getVoucher().getName() : null)
                .shippingFee(order.getShippingFee())
                .customerPaid(order.getCustomerPaid())
                .totalAfterDiscount(order.getTotalAfterDiscount())
                .note(order.getNote())
                .items(items)
                .timeline(timeline)
                .canCancel(canCancel)
                .canConfirmReceived(canConfirmReceived)
                .canBuyAgain(canBuyAgain)
                .build();
    }

    private CustomerOrderItemResponse toItemResponse(OrderDetail detail) {
        ProductDetail pd = detail.getProductDetail();
        Product product = pd != null ? pd.getProduct() : null;
        Color color = pd != null ? pd.getColor() : null;
        StorageCapacity storage = pd != null ? pd.getStorageCapacity() : null;

        List<Serial> serials = detail.getSerials() != null ? detail.getSerials() : Collections.emptyList();
        List<String> serialNumbers = serials.stream()
                .map(Serial::getSerialNumber)
                .filter(s -> s != null && !s.isBlank())
                .collect(Collectors.toList());

        String variantLabel = buildVariantLabel(pd);

        String imageUrl = pd != null ? pd.getImageUrl() : null;
        if ((imageUrl == null || imageUrl.isBlank()) && product != null
                && product.getImages() != null && !product.getImages().isEmpty()) {
            imageUrl = product.getImages().get(0).getUrl();
        }

        return CustomerOrderItemResponse.builder()
                .id(detail.getId())
                .productDetailId(pd != null ? pd.getId() : null)
                .productName(product != null ? product.getName() : "Sản phẩm không xác định")
                .brandName(product != null && product.getBrand() != null ? product.getBrand().getName() : null)
                .productImage(imageUrl)
                .variantLabel(variantLabel)
                .colorName(color != null ? color.getName() : null)
                .storageLabel(storage != null ? storage.getName() : null)
                .quantity(detail.getQuantity())
                .unitPrice(detail.getUnitPrice())
                .discountAmount(detail.getDiscountAmount())
                .totalPrice(detail.getTotalPrice())
                .serialNumbers(serialNumbers)
                .serialCount(serialNumbers.size())
                .build();
    }

    private String buildVariantLabel(ProductDetail pd) {
        if (pd == null) return "";
        StringBuilder sb = new StringBuilder();
        if (pd.getVariantVersion() != null && !pd.getVariantVersion().isBlank()) {
            sb.append(pd.getVariantVersion());
        }
        if (pd.getColor() != null && pd.getColor().getName() != null && !pd.getColor().getName().isBlank()) {
            if (sb.length() > 0) sb.append(" / ");
            sb.append(pd.getColor().getName());
        }
        if (pd.getStorageCapacity() != null && pd.getStorageCapacity().getName() != null && !pd.getStorageCapacity().getName().isBlank()) {
            if (sb.length() > 0) sb.append(" / ");
            sb.append(pd.getStorageCapacity().getName());
        }
        return sb.toString();
    }

    private List<CustomerOrderHistoryResponse> toTimeline(List<OrderHistory> histories, OrderStatus currentStatus) {
        if (histories == null || histories.isEmpty()) {
            if (currentStatus != null) {
                return List.of(CustomerOrderHistoryResponse.builder()
                        .status(currentStatus.name())
                        .statusLabel(labelOrderStatus(currentStatus))
                        .timestamp(LocalDateTime.now())
                        .isCompleted(false)
                        .isCurrent(true)
                        .performedBy("Hệ thống")
                        .build());
            }
            return Collections.emptyList();
        }

        List<CustomerOrderHistoryResponse> timeline = new ArrayList<>();
        Set<OrderStatus> seenStatuses = new LinkedHashSet<>();

        for (OrderHistory h : histories) {
            if (h.getTrangThai() == null) continue;
            if (seenStatuses.contains(h.getTrangThai())) continue;
            seenStatuses.add(h.getTrangThai());

            String performedBy = "Hệ thống";
            if (h.getNhanVien() != null && h.getNhanVien().getName() != null) {
                performedBy = "Nhân viên: " + h.getNhanVien().getName();
            } else if (h.getKhachHang() != null) {
                performedBy = "Khách hàng";
            }

            timeline.add(CustomerOrderHistoryResponse.builder()
                    .id(h.getId())
                    .status(h.getTrangThai().name())
                    .statusLabel(labelOrderStatus(h.getTrangThai()))
                    .timestamp(h.getThoiGian())
                    .note(h.getNote())
                    .performedBy(performedBy)
                    .isCompleted(false)
                    .isCurrent(h.getTrangThai() == currentStatus)
                    .build());
        }

        if (currentStatus != null && !seenStatuses.contains(currentStatus)) {
            timeline.add(CustomerOrderHistoryResponse.builder()
                    .status(currentStatus.name())
                    .statusLabel(labelOrderStatus(currentStatus))
                    .timestamp(LocalDateTime.now())
                    .isCompleted(false)
                    .isCurrent(true)
                    .performedBy("Hệ thống")
                    .build());
        }

        boolean foundCurrent = false;
        for (int i = timeline.size() - 1; i >= 0; i--) {
            if (timeline.get(i).getIsCurrent() != null && timeline.get(i).getIsCurrent()) {
                foundCurrent = true;
            }
            if (!foundCurrent) {
                timeline.get(i).setIsCompleted(true);
            }
        }

        return timeline;
    }

    private CustomerOrderListResponse.OrderItemPreview toItemPreview(ProductDetail pd, Integer quantity) {
        if (pd == null) {
            return CustomerOrderListResponse.OrderItemPreview.builder()
                    .productName("Sản phẩm")
                    .quantity(quantity)
                    .build();
        }
        String name = pd.getProduct() != null ? pd.getProduct().getName() : "Sản phẩm";
        String image = pd.getImageUrl();
        if ((image == null || image.isBlank()) && pd.getProduct() != null
                && pd.getProduct().getImages() != null && !pd.getProduct().getImages().isEmpty()) {
            image = pd.getProduct().getImages().get(0).getUrl();
        }
        return CustomerOrderListResponse.OrderItemPreview.builder()
                .productName(name)
                .productImage(image)
                .variantLabel(buildVariantLabel(pd))
                .quantity(quantity)
                .build();
    }

    // ===== CANCEL ORDER =====

    @Override
    @Transactional
    public Map<String, Object> cancelOrder(String customerId, String orderId, String reason) {
        Order order = orderRepository.findByIdWithHistories(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!customerId.equals(order.getCustomer().getId())) {
            throw new RuntimeException("Không tìm thấy đơn hàng");
        }

        OrderStatus currentStatus = order.getOrderStatus();
        if (currentStatus == null || !CANCELABLE_STATUSES.contains(currentStatus)) {
            throw new RuntimeException("Không thể hủy đơn hàng ở trạng thái '" + labelOrderStatus(currentStatus) + "'");
        }

        order.setOrderStatus(OrderStatus.DA_HUY);
        order.setLastModifiedDate(System.currentTimeMillis());
        if (order.getPaymentDate() != null) {
            order.setPaymentDate(null);
        }
        Order savedOrder = orderRepository.save(order);

        OrderHistory history = new OrderHistory();
        history.setOrder(savedOrder);
        history.setHoaDon(savedOrder);
        history.setTrangThai(OrderStatus.DA_HUY);
        history.setThoiGian(LocalDateTime.now());
        history.setNote(reason != null && !reason.isBlank() ? reason : "Khách hàng tự hủy đơn");
        history.setKhachHang(order.getCustomer());
        orderHistoryRepository.save(history);

        traIMEIVeKho(savedOrder);
        hoanTraVoucher(savedOrder);
        hoanTienNeuCan(savedOrder);

        log.info("Khách hàng {} hủy đơn hàng {}", customerId, order.getCode());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("orderId", savedOrder.getId());
        result.put("orderCode", savedOrder.getCode());
        result.put("status", OrderStatus.DA_HUY.name());
        result.put("statusLabel", labelOrderStatus(OrderStatus.DA_HUY));
        result.put("message", "Đơn hàng đã được hủy thành công");
        return result;
    }

    private void traIMEIVeKho(Order order) {
        List<OrderDetail> details = orderDetailRepository.findByOrderId(order.getId());
        for (OrderDetail detail : details) {
            if (detail.getSerials() != null && !detail.getSerials().isEmpty()) {
                for (Serial s : detail.getSerials()) {
                    s.setSerialStatus(SerialStatus.AVAILABLE);
                    s.setOrderDetail(null);
                    s.setOrderHolding(null);
                    s.setLockedAt(null);
                }
                serialRepository.saveAll(detail.getSerials());
            }
        }
        log.info("Đã trả IMEI về kho cho hóa đơn {}", order.getCode());
    }

    private void hoanTraVoucher(Order order) {
        Voucher voucher = order.getVoucher();
        if (voucher == null) return;

        VoucherDetail vd = voucherDetailRepository.findByOrder_Id(order.getId());
        if (vd != null && vd.getUsageStatus() != null && vd.getUsageStatus() == 1) {
            vd.setUsageStatus(0);
            vd.setUsedDate(null);
            vd.setOrder(null);
            voucherDetailRepository.save(vd);

            if (voucher.getQuantity() != null) {
                voucher.setQuantity(voucher.getQuantity() + 1);
                voucherRepository.save(voucher);
            }
            log.info("Đã hoàn voucher {} cho hóa đơn {}", voucher.getCode(), order.getCode());
        }
    }

    private void hoanTienNeuCan(Order order) {
        if (order.getPaymentDate() == null) return;

        PaymentHistory refund = new PaymentHistory();
        refund.setOrder(order);
        refund.setAmount(
                order.getTotalAfterDiscount() != null
                        ? order.getTotalAfterDiscount().negate()
                        : (order.getTotalAmount() != null ? order.getTotalAmount().negate() : BigDecimal.ZERO)
        );
        refund.setTransactionType("HOAN_TIEN");
        refund.setTransactionCode("REFUND-" + order.getCode() + "-" + System.currentTimeMillis());
        refund.setNote("Hoàn tiền do khách hàng hủy đơn hàng");
        refund.setTrangThaiThanhToan(PaymentStatus.CHUA_THANH_TOAN);
        paymentHistoryRepository.save(refund);

        order.setPaymentDate(null);
        orderRepository.save(order);
        log.info("Đã hoàn tiền cho hóa đơn {}", order.getCode());
    }

    // ===== CONFIRM RECEIVED =====

    @Override
    @Transactional
    public Map<String, Object> confirmReceived(String customerId, String orderId) {
        Order order = orderRepository.findByIdWithHistories(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!customerId.equals(order.getCustomer().getId())) {
            throw new RuntimeException("Không tìm thấy đơn hàng");
        }

        if (order.getOrderStatus() != OrderStatus.DANG_GIAO) {
            throw new RuntimeException("Chỉ có thể xác nhận đã nhận hàng khi đơn đang ở trạng thái 'Đang giao hàng'");
        }

        order.setOrderStatus(OrderStatus.HOAN_THANH);
        order.setLastModifiedDate(System.currentTimeMillis());
        if (order.getPaymentDate() == null) {
            order.setPaymentDate(System.currentTimeMillis());
        }
        Order savedOrder = orderRepository.save(order);

        OrderHistory history = new OrderHistory();
        history.setOrder(savedOrder);
        history.setHoaDon(savedOrder);
        history.setTrangThai(OrderStatus.HOAN_THANH);
        history.setThoiGian(LocalDateTime.now());
        history.setNote("Khách hàng xác nhận đã nhận hàng");
        history.setKhachHang(order.getCustomer());
        orderHistoryRepository.save(history);

        log.info("Khách hàng {} xác nhận đã nhận hàng {}", customerId, order.getCode());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("orderId", savedOrder.getId());
        result.put("orderCode", savedOrder.getCode());
        result.put("status", OrderStatus.HOAN_THANH.name());
        result.put("statusLabel", labelOrderStatus(OrderStatus.HOAN_THANH));
        result.put("message", "Xác nhận đã nhận hàng thành công!");
        return result;
    }

    // ===== BUY AGAIN =====

    @Override
    @Transactional
    public Map<String, Object> buyAgain(String customerId, String orderId) {
        Order order = orderRepository.findByIdWithHistories(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!customerId.equals(order.getCustomer().getId())) {
            throw new RuntimeException("Không tìm thấy đơn hàng");
        }

        if (order.getOrderStatus() == null || !BUY_AGAIN_ALLOWED_STATUSES.contains(order.getOrderStatus())) {
            throw new RuntimeException("Chỉ có thể mua lại đơn hàng đã hoàn thành");
        }

        Cart cart = cartService.getOrCreateCart(customerId);
        List<OrderDetail> details = orderDetailRepository.findByOrderId(order.getId());
        List<String> addedProducts = new ArrayList<>();
        List<String> unavailableProducts = new ArrayList<>();

        for (OrderDetail detail : details) {
            ProductDetail pd = detail.getProductDetail();
            if (pd == null) continue;

            if (pd.getQuantity() == null || pd.getQuantity() < detail.getQuantity()) {
                String name = pd.getProduct() != null ? pd.getProduct().getName() : "Sản phẩm";
                unavailableProducts.add(name + " (còn " + (pd.getQuantity() != null ? pd.getQuantity() : 0) + ")");
                continue;
            }

            try {
                AddToCartRequest request = new AddToCartRequest();
                request.setProductDetailId(pd.getId());
                request.setQuantity(detail.getQuantity());
                cartDetailService.addToCart(customerId, request);
                String name = pd.getProduct() != null ? pd.getProduct().getName() : "Sản phẩm";
                addedProducts.add(name);
            } catch (Exception e) {
                String name = pd.getProduct() != null ? pd.getProduct().getName() : "Sản phẩm";
                unavailableProducts.add(name + " (lỗi)");
            }
        }

        log.info("Khách hàng {} mua lại đơn hàng {}: {} sản phẩm thêm, {} không khả dụng",
                customerId, order.getCode(), addedProducts.size(), unavailableProducts.size());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("orderId", order.getId());
        result.put("orderCode", order.getCode());
        result.put("addedCount", addedProducts.size());
        result.put("addedProducts", addedProducts);
        result.put("unavailableProducts", unavailableProducts);
        result.put("cartItemCount", cartDetailRepository.findByCart_Id(cart.getId()).size());
        result.put("message", addedProducts.isEmpty()
                ? "Không có sản phẩm nào có thể thêm vào giỏ hàng"
                : "Đã thêm " + addedProducts.size() + " sản phẩm vào giỏ hàng");
        return result;
    }

    // ===== HELPERS =====

    private String labelOrderStatus(OrderStatus s) {
        if (s == null) return "Không xác định";
        return ORDER_STATUS_LABELS.getOrDefault(s, s.name());
    }

    private String labelPaymentStatus(PaymentStatus s) {
        if (s == null) return "Không xác định";
        return PAYMENT_STATUS_LABELS.getOrDefault(s, s.name());
    }

    private String labelPaymentMethod(String m) {
        if (m == null) return "Không xác định";
        return PAYMENT_METHOD_LABELS.getOrDefault(m, m);
    }
}
