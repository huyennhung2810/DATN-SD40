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
    private final ProductDetailRepository productDetailRepository;

    @Override
    @Transactional
    public CheckoutResponse checkout(CheckoutRequest request, String customerId, HttpServletRequest httpRequest) {
        // 1. Lấy thông tin khách hàng
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng!"));

        // 2. KHỞI TẠO DANH SÁCH CHI TIẾT ĐƠN HÀNG TẠM THỜI
        List<OrderDetail> tempOrderDetails = new java.util.ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        // 3. XỬ LÝ NGUỒN HÀNG (MUA NGAY HOẶC GIỎ HÀNG)
        if (Boolean.TRUE.equals(request.getIsBuyNow()) && request.getItems() != null && !request.getItems().isEmpty()) {
            // TRƯỜNG HỢP: MUA NGAY
            for (CheckoutRequest.ItemRequest itemReq : request.getItems()) {
                ProductDetail pd = productDetailRepository.findById(itemReq.getProductDetailId())
                        .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại hoặc đã bị xóa!"));

                OrderDetail od = new OrderDetail();
                od.setProductDetail(pd);
                od.setQuantity(itemReq.getQuantity());
                od.setUnitPrice(pd.getSalePrice());
                BigDecimal itemTotal = pd.getSalePrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
                od.setTotalPrice(itemTotal);

                tempOrderDetails.add(od);
                totalAmount = totalAmount.add(itemTotal);
            }
        } else {
            // TRƯỜNG HỢP: MUA TỪ GIỎ HÀNG
            Cart cart = cartService.getOrCreateCart(customerId);
            List<CartDetail> cartItems = cartDetailRepository.findByCart_Id(cart.getId());

            if (cartItems == null || cartItems.isEmpty()) {
                throw new RuntimeException("Giỏ hàng của bạn đang trống!");
            }

            for (CartDetail cd : cartItems) {
                OrderDetail od = new OrderDetail();
                od.setProductDetail(cd.getProductDetail());
                od.setQuantity(cd.getQuantity());
                od.setUnitPrice(cd.getProductDetail().getSalePrice());
                BigDecimal itemTotal = od.getUnitPrice().multiply(BigDecimal.valueOf(cd.getQuantity()));
                od.setTotalPrice(itemTotal);

                tempOrderDetails.add(od);
                totalAmount = totalAmount.add(itemTotal);
            }
        }

        // 4. XỬ LÝ VOUCHER & TÍNH TIỀN (Dùng totalAmount đã tính ở trên)
        BigDecimal discountAmount = BigDecimal.ZERO;
        Voucher appliedVoucher = null;

        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            appliedVoucher = voucherRepository.findByCode(request.getVoucherCode())
                    .orElseThrow(() -> new RuntimeException("Mã giảm giá không hợp lệ!"));

            // Kiểm tra điều kiện Voucher (Không dùng cartItems nữa)
            if (appliedVoucher.getConditions() != null && totalAmount.compareTo(appliedVoucher.getConditions()) < 0) {
                throw new RuntimeException("Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã!");
            }

            // Tính số tiền giảm
            if ("PERCENT".equalsIgnoreCase(appliedVoucher.getDiscountUnit())) {
                discountAmount = totalAmount.multiply(appliedVoucher.getDiscountValue())
                        .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
                if (appliedVoucher.getMaxDiscountAmount() != null) {
                    discountAmount = discountAmount.min(appliedVoucher.getMaxDiscountAmount());
                }
            } else {
                discountAmount = appliedVoucher.getDiscountValue();
            }
        }

        BigDecimal totalAfterDiscount = totalAmount.subtract(discountAmount).max(BigDecimal.ZERO);

        // 5. TẠO THỰC THỂ ORDER
        Order order = new Order();
        order.setCustomer(customer);
        order.setRecipientName(request.getRecipientName());
        order.setRecipientPhone(request.getRecipientPhone());
        order.setRecipientEmail(request.getRecipientEmail());
        order.setRecipientAddress(request.getRecipientAddress());
        order.setTotalAmount(totalAmount);
        order.setTotalAfterDiscount(totalAfterDiscount);
        order.setPaymentMethod(request.getPaymentMethod());
        order.setNote(request.getNote());
        order.setOrderType(TypeInvoice.ONLINE);
        order.setOrderStatus(OrderStatus.CHO_XAC_NHAN);
        order.setVoucher(appliedVoucher);

        if ("VNPAY".equalsIgnoreCase(request.getPaymentMethod())) {
            order.setPaymentStatus(PaymentStatus.CHO_THANH_TOAN_VNPAY);
        } else {
            order.setPaymentStatus(PaymentStatus.CHUA_THANH_TOAN);
        }

        Order savedOrder = orderRepository.save(order);

        // 6. LƯU CHI TIẾT ĐƠN HÀNG (OrderDetail)
        for (OrderDetail od : tempOrderDetails) {
            od.setOrder(savedOrder);
            od.setDiscountAmount(BigDecimal.ZERO);
            orderDetailRepository.save(od);
        }

        // 7. CẬP NHẬT VOUCHER & GIỎ HÀNG
        if (appliedVoucher != null) {
            appliedVoucher.setQuantity(appliedVoucher.getQuantity() - 1);
            voucherRepository.save(appliedVoucher);
        }

        // Chỉ xóa giỏ hàng nếu đặt hàng thành công bằng COD và KHÔNG PHẢI mua ngay
        if (!"VNPAY".equalsIgnoreCase(request.getPaymentMethod()) && !Boolean.TRUE.equals(request.getIsBuyNow())) {
            Cart cart = cartService.getOrCreateCart(customerId);
            cartDetailRepository.deleteByCart_Id(cart.getId());
        }

        // 8. PHẦN TRẢ VỀ (VNPay hoặc COD - Giữ nguyên logic cũ của bạn)
        if ("VNPAY".equalsIgnoreCase(request.getPaymentMethod())) {
            String paymentUrl = vnPayService.createPaymentUrl(savedOrder.getId(), totalAfterDiscount.longValue(), "Thanh toan đơn hàng", httpRequest);
            return CheckoutResponse.builder().orderId(savedOrder.getId()).status("REDIRECT").paymentUrl(paymentUrl).build();
        }

        return CheckoutResponse.builder().orderId(savedOrder.getId()).status("SUCCESS").message("Đặt hàng thành công!").build();
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
