package com.example.datn.core.admin.pos.model.request;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CheckoutPosRequest {
    /** "OFFLINE" = lấy tại quầy, "GIAO_HANG" = giao hàng */
    private String orderType;

    /** "TIEN_MAT" = tiền mặt, "CHUYEN_KHOAN" = chuyển khoản */
    private String paymentMethod;

    // Thông tin người nhận (bắt buộc khi orderType = GIAO_HANG)
    private String recipientName;
    private String recipientPhone;
    private String recipientEmail;
    private String recipientAddress;

    /** Phí giao hàng (0 khi lấy tại quầy) */
    private BigDecimal shippingFee;

    /** Số tiền khách đưa (chỉ dùng khi TIEN_MAT) */
    private BigDecimal customerPaid;
}
