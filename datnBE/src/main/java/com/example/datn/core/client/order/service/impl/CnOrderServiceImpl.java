package com.example.datn.core.client.order.service.impl;

import com.example.datn.core.client.cart.service.CartService;
import com.example.datn.core.client.cartDetail.repository.CnCartDetailRepository;
import com.example.datn.core.client.order.model.request.CheckoutRequest;
import com.example.datn.core.client.order.model.response.CheckoutResponse;
import com.example.datn.core.client.order.service.CnOrderService;
import com.example.datn.entity.Cart;
import com.example.datn.entity.CartDetail;
import com.example.datn.entity.Customer;
import com.example.datn.entity.Order;
import com.example.datn.entity.OrderDetail;
import com.example.datn.entity.PaymentHistory;
import com.example.datn.infrastructure.constant.OrderStatus;
import com.example.datn.infrastructure.constant.PaymentStatus;
import com.example.datn.infrastructure.constant.TypeInvoice;
import com.example.datn.infrastructure.payment.VNPayService;
import com.example.datn.repository.CustomerRepository;
import com.example.datn.repository.OrderDetailRepository;
import com.example.datn.repository.OrderRepository;
import com.example.datn.repository.PaymentHistoryRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CnOrderServiceImpl implements CnOrderService {

    private final CustomerRepository customerRepository;
    private final CartService cartService;
    private final CnCartDetailRepository cartDetailRepository;
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final PaymentHistoryRepository paymentHistoryRepository;
    private final VNPayService vnPayService;

    @Override
    @Transactional
    public CheckoutResponse checkout(CheckoutRequest request, HttpServletRequest httpRequest) {
        // 1. Lấy khách hàng
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng!"));

        // 2. Lấy giỏ hàng
        Cart cart = cartService.getOrCreateCart(request.getCustomerId());
        List<CartDetail> cartItems = cartDetailRepository.findByCart_Id(cart.getId());
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Giỏ hàng trống, không thể đặt hàng!");
        }

        // 3. Tính tổng tiền
        BigDecimal totalAmount = cartItems.stream()
                .map(item -> {
                    BigDecimal price = item.getProductDetail().getSalePrice();
                    return price.multiply(BigDecimal.valueOf(item.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 4. Tạo Order
        Order order = new Order();
        order.setCustomer(customer);
        order.setRecipientName(request.getRecipientName());
        order.setRecipientPhone(request.getRecipientPhone());
        order.setRecipientEmail(request.getRecipientEmail());
        order.setRecipientAddress(request.getRecipientAddress());
        order.setTotalAmount(totalAmount);
        order.setTotalAfterDiscount(totalAmount);
        order.setShippingFee(BigDecimal.ZERO);
        order.setPaymentMethod(request.getPaymentMethod());
        order.setNote(request.getNote());
        order.setOrderType(TypeInvoice.ONLINE);
        order.setOrderStatus(OrderStatus.CHO_XAC_NHAN);

        if ("VNPAY".equalsIgnoreCase(request.getPaymentMethod())) {
            order.setPaymentStatus(PaymentStatus.CHO_THANH_TOAN_VNPAY);
        } else {
            order.setPaymentStatus(PaymentStatus.CHUA_THANH_TOAN);
        }

        Order savedOrder = orderRepository.save(order);

        // 5. Tạo OrderDetail từ CartDetail
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

        // 6. Xóa giỏ hàng: chỉ xóa ngay cho COD.
        if (!"VNPAY".equalsIgnoreCase(request.getPaymentMethod())) {
            cartDetailRepository.deleteAll(cartItems);
        }

        // 7. Trả về kết quả
        if ("VNPAY".equalsIgnoreCase(request.getPaymentMethod())) {
            String paymentUrl = vnPayService.createPaymentUrl(
                    savedOrder.getId(),
                    totalAmount.longValue(),
                    "Thanh toan don hang " + savedOrder.getId(),
                    httpRequest);
            return CheckoutResponse.builder()
                    .orderId(savedOrder.getId())
                    .orderCode(savedOrder.getCode())
                    .totalAmount(totalAmount)
                    .status("REDIRECT")
                    .paymentUrl(paymentUrl)
                    .message("Đang chuyển đến trang thanh toán VNPay...")
                    .build();
        } else {
            // COD - ghi lịch sử thanh toán
            PaymentHistory history = new PaymentHistory();
            history.setId(UUID.randomUUID().toString());
            history.setOrder(savedOrder);
            history.setAmount(totalAmount);
            history.setTransactionType("THANH_TOAN");
            history.setTransactionCode("COD-" + savedOrder.getId());
            history.setThoiGian(LocalDateTime.now());
            history.setTrangThaiThanhToan(PaymentStatus.CHUA_THANH_TOAN);
            history.setNote("Thanh toán khi nhận hàng (COD)");
            paymentHistoryRepository.save(history);

            return CheckoutResponse.builder()
                    .orderId(savedOrder.getId())
                    .orderCode(savedOrder.getCode())
                    .totalAmount(totalAmount)
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
