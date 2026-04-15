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
import com.example.datn.utils.DataGeneratorUtils;
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
        // 1. Lấy thông tin khách hàng NẾU CÓ ĐĂNG NHẬP
        Customer customer = null;
        if (customerId != null && !customerId.trim().isEmpty()) {
            customer = customerRepository.findById(customerId).orElse(null);
        }

        // 2. KHỞI TẠO DANH SÁCH CHI TIẾT ĐƠN HÀNG TẠM THỜI
        List<OrderDetail> tempOrderDetails = new java.util.ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        // Lấy danh sách ID sản phẩm mà Frontend truyền lên (những item được tick chọn)
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Không có sản phẩm nào được chọn để thanh toán!");
        }

        List<String> selectedProductIds = request.getItems().stream()
                .map(CheckoutRequest.ItemRequest::getProductDetailId)
                .toList();

        // 3. XỬ LÝ NGUỒN HÀNG
        if (Boolean.TRUE.equals(request.getIsBuyNow())) {
            // MUA NGAY (Khách vãng lai và Khách có tk đều như nhau)
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
            // MUA TỪ GIỎ HÀNG
            if (customer != null) {
                // Đã đăng nhập: Check giỏ hàng trong database
                Cart cart = cartService.getOrCreateCart(customerId);
                List<CartDetail> cartItems = cartDetailRepository.findByCart_Id(cart.getId());

                if (cartItems == null || cartItems.isEmpty()) {
                    throw new RuntimeException("Giỏ hàng của bạn đang trống!");
                }

                List<CartDetail> selectedCartItems = cartItems.stream()
                        .filter(cd -> selectedProductIds.contains(cd.getProductDetail().getId()))
                        .toList();

                if (selectedCartItems.isEmpty()) {
                    throw new RuntimeException("Không có sản phẩm nào khớp trong giỏ hàng!");
                }

                for (CartDetail cd : selectedCartItems) {
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
            } else {
                // KHÁCH VÃNG LAI: Lấy trực tiếp từ Request (vì FE gửi kèm quantity)
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
            }
        }

        // 4. XỬ LÝ VOUCHER & TÍNH TIỀN
        BigDecimal discountAmount = BigDecimal.ZERO;
        Voucher appliedVoucher = null;

        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            appliedVoucher = voucherRepository.findByCode(request.getVoucherCode())
                    .orElseThrow(() -> new RuntimeException("Mã giảm giá không hợp lệ!"));

            if (appliedVoucher.getStatus() != null && appliedVoucher.getStatus() == 0) {
                throw new RuntimeException("Mã giảm giá đã bị vô hiệu hoá!");
            }
            if (appliedVoucher.getQuantity() != null && appliedVoucher.getQuantity() <= 0) {
                throw new RuntimeException("Mã giảm giá đã hết lượt sử dụng!");
            }

            if ("INDIVIDUAL".equals(appliedVoucher.getVoucherType())) {
                if (customerId == null || customerId.isEmpty()) {
                    throw new RuntimeException("Voucher này chỉ áp dụng cho tài khoản nhất định. Vui lòng đăng nhập!");
                }
                voucherDetailRepository.findUnusedByVoucherAndCustomer(appliedVoucher.getId(), customerId)
                        .orElseThrow(() -> new RuntimeException(
                                "Mã giảm giá này không áp dụng cho tài khoản của bạn hoặc đã được sử dụng!"));
            }

            long currentTime = System.currentTimeMillis();
            if (appliedVoucher.getStartDate() != null && currentTime < appliedVoucher.getStartDate()) {
                throw new RuntimeException("Mã giảm giá chưa đến thời gian áp dụng!");
            }
            if (appliedVoucher.getEndDate() != null && currentTime > appliedVoucher.getEndDate()) {
                throw new RuntimeException("Mã giảm giá đã hết hạn sử dụng!");
            }

            if (appliedVoucher.getConditions() != null && totalAmount.compareTo(appliedVoucher.getConditions()) < 0) {
                throw new RuntimeException("Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã!");
            }

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
        order.setCode(DataGeneratorUtils.generateRandomCode("ORD-"));
        order.setCustomer(customer); // NẾU KHÁCH VÃNG LAI, customer SẼ LÀ NULL
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

            if ("INDIVIDUAL".equals(appliedVoucher.getVoucherType()) && customerId != null) {
                voucherDetailRepository.findUnusedByVoucherAndCustomer(appliedVoucher.getId(), customerId)
                        .ifPresent(vd -> {
                            vd.setUsageStatus(1);
                            vd.setUsedDate(System.currentTimeMillis());
                            vd.setOrder(savedOrder);
                            voucherDetailRepository.save(vd);
                        });
            }
        }

        // 8. XÓA GIỎ HÀNG CHO KHÁCH CÓ TÀI KHOẢN (Khách vãng lai FE đã tự xóa
        // localStorage)
        if (customer != null && !"VNPAY".equalsIgnoreCase(request.getPaymentMethod())
                && !Boolean.TRUE.equals(request.getIsBuyNow())) {
            Cart cart = cartService.getOrCreateCart(customerId);
            List<CartDetail> allCartItems = cartDetailRepository.findByCart_Id(cart.getId());
            List<CartDetail> itemsToRemove = allCartItems.stream()
                    .filter(cd -> selectedProductIds.contains(cd.getProductDetail().getId()))
                    .toList();
            cartDetailRepository.deleteAll(itemsToRemove);
        }

        // 9. Gửi thông báo WebSocket cho Admin
        try {
            Map<String, Object> notif = new HashMap<>();
            notif.put("type", "NEW_ORDER");
            notif.put("title", "Đơn hàng mới");
            String buyerName = customer != null ? customer.getName()
                    : (request.getRecipientName() + " (Khách vãng lai)");
            notif.put("message", "Khách hàng " + buyerName + " vừa đặt đơn hàng " + savedOrder.getCode());
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

            // Xóa giỏ hàng NẾU ĐƠN LÀ CỦA TÀI KHOẢN
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

            Voucher voucher = order.getVoucher();
            if (voucher != null) {
                if (voucher.getQuantity() != null) {
                    voucher.setQuantity(voucher.getQuantity() + 1);
                    voucherRepository.save(voucher);
                }
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