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
    private final VoucherDetailRepository voucherDetailRepository;

    private final SimpMessagingTemplate messagingTemplate;
    private final ProductDetailRepository productDetailRepository;
    private final DiscountDetailRepository discountDetailRepository;

    /**
     * Đơn giá sau đợt khuyến mãi — phải trùng logic {@link com.example.datn.core.client.cartDetail.service.Impl.CnCartDetailServiceImpl#getCartDetails}.
     * Chỉ dùng giá KM khi bản ghi discount cha đang active (status = 2), không dùng
     * {@code findFirstByProductDetail_IdAndStatus(..., 1)} vì có thể khớp dòng detail cũ
     * trong khi đợt KM đã tắt → lệch giá so với checkout.
     */
    private BigDecimal resolveCampaignUnitPrice(ProductDetail pd) {
        BigDecimal salePrice = pd.getSalePrice();
        if (salePrice == null) {
            return BigDecimal.ZERO;
        }
        DiscountDetail active = discountDetailRepository.getActiveDiscountByProductDetailId(pd.getId());
        if (active != null && active.getPriceAfter() != null) {
            return active.getPriceAfter();
        }
        return salePrice;
    }

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

                BigDecimal salePrice = pd.getSalePrice() != null ? pd.getSalePrice() : BigDecimal.ZERO;
                BigDecimal unit = resolveCampaignUnitPrice(pd);

                OrderDetail od = new OrderDetail();
                od.setProductDetail(pd);
                od.setQuantity(itemReq.getQuantity());
                od.setOriginalPrice(salePrice);
                od.setUnitPrice(unit);
                BigDecimal itemTotal = unit.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
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
                ProductDetail pd = cd.getProductDetail();
                BigDecimal salePrice = pd.getSalePrice() != null ? pd.getSalePrice() : BigDecimal.ZERO;
                BigDecimal unit = resolveCampaignUnitPrice(pd);

                OrderDetail od = new OrderDetail();
                od.setProductDetail(pd);
                od.setQuantity(cd.getQuantity());
                od.setOriginalPrice(salePrice);
                od.setUnitPrice(unit);
                BigDecimal itemTotal = unit.multiply(BigDecimal.valueOf(cd.getQuantity()));
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

            // 4.1. Kiểm tra trạng thái và số lượng
            // Chỉ chặn khi status = 0 (buộc dừng thủ công); timing kiểm tra ở bước 4.3
            if (appliedVoucher.getStatus() != null && appliedVoucher.getStatus() == 0) {
                throw new RuntimeException("Mã giảm giá đã bị vô hiệu hoá!");
            }
            if (appliedVoucher.getQuantity() != null && appliedVoucher.getQuantity() <= 0) {
                throw new RuntimeException("Mã giảm giá đã hết lượt sử dụng!");
            }

            // 4.2. Kiểm tra voucher cá nhân: phải thuộc khách hàng và chưa sử dụng
            if ("INDIVIDUAL".equals(appliedVoucher.getVoucherType())) {
                voucherDetailRepository.findUnusedByVoucherAndCustomer(appliedVoucher.getId(), customerId)
                        .orElseThrow(() -> new RuntimeException(
                                "Mã giảm giá này không áp dụng cho tài khoản của bạn hoặc đã được sử dụng!"));
            }

            // 4.3. Kiểm tra thời hạn (startDate, endDate)
            long currentTime = System.currentTimeMillis();
            if (appliedVoucher.getStartDate() != null && currentTime < appliedVoucher.getStartDate()) {
                throw new RuntimeException("Mã giảm giá chưa đến thời gian áp dụng!");
            }
            if (appliedVoucher.getEndDate() != null && currentTime > appliedVoucher.getEndDate()) {
                throw new RuntimeException("Mã giảm giá đã hết hạn sử dụng!");
            }

            // 4.4. Kiểm tra giá trị đơn hàng tối thiểu (conditions)
            if (appliedVoucher.getConditions() != null && totalAmount.compareTo(appliedVoucher.getConditions()) < 0) {
                throw new RuntimeException("Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã!");
            }

            // 4.5. Tính số tiền giảm
            if ("PERCENT".equalsIgnoreCase(appliedVoucher.getDiscountUnit())
                    || "%".equals(appliedVoucher.getDiscountUnit())) {
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
            ProductDetail pd = od.getProductDetail();
            BigDecimal sale = pd.getSalePrice() != null ? pd.getSalePrice() : BigDecimal.ZERO;
            BigDecimal promoLine = sale.subtract(od.getUnitPrice())
                    .multiply(BigDecimal.valueOf(od.getQuantity()))
                    .max(BigDecimal.ZERO);
            od.setDiscountAmount(promoLine);
            orderDetailRepository.save(od);
        }

        // 7. CẬP NHẬT VOUCHER
        if (appliedVoucher != null) {
            appliedVoucher.setQuantity(appliedVoucher.getQuantity() - 1);
            voucherRepository.save(appliedVoucher);

            // Đánh dấu VoucherDetail là đã sử dụng (usageStatus = 1) nếu là INDIVIDUAL
            if ("INDIVIDUAL".equals(appliedVoucher.getVoucherType())) {
                voucherDetailRepository.findUnusedByVoucherAndCustomer(appliedVoucher.getId(), customerId)
                        .ifPresent(vd -> {
                            vd.setUsageStatus(1);
                            vd.setUsedDate(System.currentTimeMillis());
                            vd.setOrder(savedOrder);
                            voucherDetailRepository.save(vd);
                        });
            }
        }

        // 8. XÓA GIỎ HÀNG (chỉ với COD và không phải mua ngay)
        if (!"VNPAY".equalsIgnoreCase(request.getPaymentMethod()) && !Boolean.TRUE.equals(request.getIsBuyNow())) {
            Cart cart = cartService.getOrCreateCart(customerId);
            cartDetailRepository.deleteByCart_Id(cart.getId());
        }

        // 9. Gửi thông báo WebSocket cho Admin
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

        // 10. Trả về kết quả
        if ("VNPAY".equalsIgnoreCase(request.getPaymentMethod())) {
            String paymentUrl = vnPayService.createPaymentUrl(
                    savedOrder.getId(),
                    totalAfterDiscount.longValue(),
                    "Thanh toan don hang " + savedOrder.getId(),
                    httpRequest);

            return CheckoutResponse.builder()
                    .orderId(savedOrder.getId())
                    .orderCode(savedOrder.getCode())
                    .totalAmount(totalAfterDiscount)
                    .status("REDIRECT")
                    .paymentUrl(paymentUrl)
                    .message("Đang chuyển đến trang thanh toán VNPay...")
                    .build();
        } else {
            // COD - Ghi nhận lịch sử thanh toán
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

        // Idempotency: nếu đơn đã được xử lý rồi thì bỏ qua (VNPay gọi lại lần 2)
        if (order.getPaymentStatus() == PaymentStatus.DA_THANH_TOAN) {
            return;
        }

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
            // Thanh toán thất bại / quá thời gian → hoàn lại voucher
            order.setPaymentStatus(PaymentStatus.THANH_TOAN_THAT_BAI);
            history.setTrangThaiThanhToan(PaymentStatus.THANH_TOAN_THAT_BAI);

            Voucher voucher = order.getVoucher();
            if (voucher != null) {
                // Hoàn lại 1 lượt sử dụng
                if (voucher.getQuantity() != null) {
                    voucher.setQuantity(voucher.getQuantity() + 1);
                    voucherRepository.save(voucher);
                }
                // Nếu là INDIVIDUAL: hoàn lại VoucherDetail về chưa sử dụng
                if ("INDIVIDUAL".equals(voucher.getVoucherType())) {
                    VoucherDetail vd = voucherDetailRepository.findByOrder_Id(order.getId());
                    if (vd != null && Integer.valueOf(1).equals(vd.getUsageStatus())) {
                        vd.setUsageStatus(0);
                        vd.setUsedDate(null);
                        vd.setOrder(null);
                        voucherDetailRepository.save(vd);
                    }
                }
            }
        }

        orderRepository.save(order);
        paymentHistoryRepository.save(history);
    }
}
