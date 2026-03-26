package com.example.datn.core.client.order.service.impl;

import com.example.datn.core.client.cart.service.CartService;
import com.example.datn.core.client.cartDetail.repository.CnCartDetailRepository;
import com.example.datn.core.client.order.model.request.CheckoutRequest;
import com.example.datn.core.client.order.model.response.CheckoutResponse;
import com.example.datn.core.client.order.service.CnOrderService;
import com.example.datn.entity.*;
import com.example.datn.infrastructure.constant.OrderStatus;
import com.example.datn.infrastructure.constant.PaymentStatus;
import com.example.datn.infrastructure.constant.TypeInvoice;
import com.example.datn.infrastructure.payment.VNPayService;
import com.example.datn.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CnOrderServiceImpl implements CnOrderService {

    private final CustomerRepository customerRepository;
    private final CartService cartService;
    private final CnCartDetailRepository cartDetailRepository;
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final PaymentHistoryRepository paymentHistoryRepository;
    private final VNPayService vnPayService;

    private final VoucherRepository voucherRepository;

    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public CheckoutResponse checkout(CheckoutRequest request, String customerId, HttpServletRequest httpRequest) {
        // 1. Lấy khách hàng từ customerId (được trích xuất từ JWT)
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng!"));

        // 2. Lấy giỏ hàng
        Cart cart = cartService.getOrCreateCart(customerId);
        List<CartDetail> cartItems = cartDetailRepository.findByCart_Id(cart.getId());
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Giỏ hàng trống, không thể đặt hàng!");
        }

        // 3. Tính tổng tiền gốc (Subtotal)
        BigDecimal totalAmount = cartItems.stream()
                .map(item -> {
                    BigDecimal price = item.getProductDetail().getSalePrice();
                    return price.multiply(BigDecimal.valueOf(item.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 4. XỬ LÝ VOUCHER & TÍNH TIỀN SAU GIẢM GIÁ
        BigDecimal discountAmount = BigDecimal.ZERO;
        Voucher appliedVoucher = null;

        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            // Lấy Voucher từ DB
            appliedVoucher = voucherRepository.findByCode(request.getVoucherCode())
                    .orElseThrow(() -> new RuntimeException("Mã giảm giá không hợp lệ hoặc không tồn tại!"));

            // 4.1. Kiểm tra trạng thái và số lượng
            if (appliedVoucher.getStatus() != null && appliedVoucher.getStatus() != 2) { // Giả sử 2 là Đang diễn ra
                throw new RuntimeException("Mã giảm giá không trong thời gian hoạt động!");
            }
            if (appliedVoucher.getQuantity() != null && appliedVoucher.getQuantity() <= 0) {
                throw new RuntimeException("Mã giảm giá đã hết lượt sử dụng!");
            }

            // 4.2. Kiểm tra thời hạn (startDate, endDate)
            long currentTime = System.currentTimeMillis();
            if (appliedVoucher.getStartDate() != null && currentTime < appliedVoucher.getStartDate()) {
                throw new RuntimeException("Mã giảm giá chưa đến thời gian áp dụng!");
            }
            if (appliedVoucher.getEndDate() != null && currentTime > appliedVoucher.getEndDate()) {
                throw new RuntimeException("Mã giảm giá đã hết hạn sử dụng!");
            }

            // 4.3. Kiểm tra giá trị đơn hàng tối thiểu (conditions)
            if (appliedVoucher.getConditions() != null && totalAmount.compareTo(appliedVoucher.getConditions()) < 0) {
                throw new RuntimeException("Đơn hàng chưa đạt giá trị tối thiểu (" + appliedVoucher.getConditions() + "đ) để áp dụng mã này!");
            }

            // 4.4. Tính toán số tiền được giảm
            String unit = appliedVoucher.getDiscountUnit();
            // Trong Entity bạn comment là // %, VND nên mình check cả 2 trường hợp
            if ("PERCENT".equalsIgnoreCase(unit) || "%".equals(unit)) {
                // Tính % giảm (discountValue đã là BigDecimal)
                discountAmount = totalAmount.multiply(appliedVoucher.getDiscountValue()).divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);

                // Áp dụng giới hạn giảm tối đa (nếu có)
                if (appliedVoucher.getMaxDiscountAmount() != null && appliedVoucher.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                    discountAmount = discountAmount.min(appliedVoucher.getMaxDiscountAmount());
                }
            } else {
                // Giảm thẳng tiền mặt (VND)
                discountAmount = appliedVoucher.getDiscountValue();
            }
        }

        // Tiền thực tế khách phải trả (Không được nhỏ hơn 0)
        BigDecimal totalAfterDiscount = totalAmount.subtract(discountAmount).max(BigDecimal.ZERO);

        // 5. Tạo Order
        Order order = new Order();
        // ... (các set thông tin user giữ nguyên như code trước) ...

        // --- Set tiền ---
        order.setTotalAmount(totalAmount);
        order.setTotalAfterDiscount(totalAfterDiscount);

        // --- Set Voucher vào Order & Trừ số lượng ---
        if (appliedVoucher != null) {
            order.setVoucher(appliedVoucher);

            // Trừ đi 1 lượt sử dụng của Voucher và lưu lại
            appliedVoucher.setQuantity(appliedVoucher.getQuantity() - 1);
            voucherRepository.save(appliedVoucher);
        }

        // 5. Tạo Order
        Order order1 = new Order();
        order1.setCustomer(customer);
        order1.setRecipientPhone(request.getRecipientPhone());
        order1.setRecipientEmail(request.getRecipientEmail());
        order1.setRecipientAddress(request.getRecipientAddress());

        // --- Set tiền ---
        order1.setTotalAmount(totalAmount);
        order1.setTotalAfterDiscount(totalAfterDiscount);

        // --- Set Voucher vào Order ---
        if (appliedVoucher != null) {
            order1.setVoucher(appliedVoucher);
        }

        order1.setShippingFee(BigDecimal.ZERO);
        order1.setPaymentMethod(request.getPaymentMethod());
        order1.setNote(request.getNote());
        order1.setOrderType(TypeInvoice.ONLINE);
        order1.setOrderStatus(OrderStatus.CHO_XAC_NHAN);

        if ("VNPAY".equalsIgnoreCase(request.getPaymentMethod())) {
            order1.setPaymentStatus(PaymentStatus.CHO_THANH_TOAN_VNPAY);
        } else {
            order1.setPaymentStatus(PaymentStatus.CHUA_THANH_TOAN);
        }

        Order savedOrder = orderRepository.save(order1);

        // 6. Tạo OrderDetail
        for (CartDetail cartDetail : cartItems) {
            BigDecimal price = cartDetail.getProductDetail().getSalePrice();

            OrderDetail orderDetail = new OrderDetail();
            orderDetail.setOrder(savedOrder);
            orderDetail.setProductDetail(cartDetail.getProductDetail());
            orderDetail.setQuantity(cartDetail.getQuantity());
            orderDetail.setUnitPrice(price);
            orderDetail.setDiscountAmount(BigDecimal.ZERO);
            orderDetail.setTotalPrice(price.multiply(BigDecimal.valueOf(cartDetail.getQuantity())));
            orderDetailRepository.save(orderDetail);
        }

        // 7. Xóa giỏ hàng: chỉ xóa ngay cho COD.
        if (!"VNPAY".equalsIgnoreCase(request.getPaymentMethod())) {
            cartDetailRepository.deleteAll(cartItems);
        }

        // 8. Gửi thông báo WebSocket cho Admin
        try {
            Map<String, Object> notif = new HashMap<>();
            notif.put("type", "NEW_ORDER");
            notif.put("title", "Đơn hàng mới");
            notif.put("message", "Khách hàng " + customer.getName() + " vừa đặt đơn hàng " + savedOrder.getCode());
            notif.put("refId", savedOrder.getId());
            notif.put("refCode", savedOrder.getCode());
            notif.put("timestamp", System.currentTimeMillis());
            messagingTemplate.convertAndSend("/topic/admin/notifications", notif);
        } catch (Exception e) {
            log.warn("Không thể gửi thông báo WebSocket: {}", e.getMessage());
        }

        // 9. Trả về kết quả
        if ("VNPAY".equalsIgnoreCase(request.getPaymentMethod())) {
            // Truyền totalAfterDiscount sang VNPay
            String paymentUrl = vnPayService.createPaymentUrl(
                    savedOrder.getId(),
                    totalAfterDiscount.longValue(),
                    "Thanh toan don hang " + savedOrder.getId(),
                    httpRequest);

            return CheckoutResponse.builder()
                    .orderId(savedOrder.getId())
                    .orderCode(savedOrder.getCode())
                    .totalAmount(totalAfterDiscount) // Trả về frontend số tiền đã giảm
                    .status("REDIRECT")
                    .paymentUrl(paymentUrl)
                    .message("Đang chuyển đến trang thanh toán VNPay...")
                    .build();
        } else {
            // COD - Ghi nhận lịch sử thanh toán với totalAfterDiscount
            PaymentHistory history = new PaymentHistory();
            history.setId(UUID.randomUUID().toString());
            history.setOrder(savedOrder);
            history.setAmount(totalAfterDiscount);
            history.setTransactionType("THANH_TOAN");
            history.setTransactionCode("COD-" + savedOrder.getId());
            history.setThoiGian(LocalDateTime.now());
            history.setTrangThaiThanhToan(PaymentStatus.CHUA_THANH_TOAN);
            history.setNote("Thanh toán khi nhận hàng (COD)");
            paymentHistoryRepository.save(history);

            return CheckoutResponse.builder()
                    .orderId(savedOrder.getId())
                    .orderCode(savedOrder.getCode())
                    .totalAmount(totalAfterDiscount)
                    .status("SUCCESS")
                    .message("Đặt hàng thành công! Chúng tôi sẽ liên hệ xác nhận sớm.")
                    .build();
        }
    }

    @Override
    @Transactional
    public void handleVNPayReturn(Map<String, String> params) {
        if (!vnPayService.verifyReturn(params)) {
            throw new RuntimeException("Chữ ký VNPay không hợp lệ!");
        }

        String orderId = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String transactionNo = params.get("vnp_TransactionNo");
        String amountStr = params.get("vnp_Amount");

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + orderId));

        BigDecimal amount = amountStr != null
                ? new BigDecimal(amountStr).divide(BigDecimal.valueOf(100))
                : order.getTotalAmount();

        PaymentHistory history = new PaymentHistory();
        history.setId(UUID.randomUUID().toString());
        history.setOrder(order);
        history.setAmount(amount);
        history.setTransactionType("THANH_TOAN");
        history.setTransactionCode("VNPAY-" + transactionNo);
        history.setThoiGian(LocalDateTime.now());
        history.setNote("Thanh toán qua VNPay, mã GD: " + transactionNo);

        if ("00".equals(responseCode)) {
            order.setPaymentStatus(PaymentStatus.DA_THANH_TOAN);
            order.setPaymentDate(System.currentTimeMillis());
            order.setCustomerPaid(amount);
            history.setTrangThaiThanhToan(PaymentStatus.DA_THANH_TOAN);

            // Xóa giỏ hàng sau khi VNPay xác nhận thanh toán thành công
            if (order.getCustomer() != null) {
                String cartId = cartService.getOrCreateCart(order.getCustomer().getId()).getId();
                List<CartDetail> remaining = cartDetailRepository.findByCart_Id(cartId);
                if (!remaining.isEmpty()) {
                    cartDetailRepository.deleteAll(remaining);
                }
            }
        } else {
            order.setPaymentStatus(PaymentStatus.THANH_TOAN_THAT_BAI);
            history.setTrangThaiThanhToan(PaymentStatus.THANH_TOAN_THAT_BAI);
        }

        orderRepository.save(order);
        paymentHistoryRepository.save(history);
    }
}
