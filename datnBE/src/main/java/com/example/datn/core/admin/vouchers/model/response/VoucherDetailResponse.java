package com.example.datn.core.admin.vouchers.model.response;

import com.example.datn.entity.VoucherDetail;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class VoucherDetailResponse {
    private String id;
    private Integer usageStatus;
    private Long usedDate;

    // Chỉ trả ra những ID cần thiết cho Frontend, không trả ra cả Object to đùng
    private String customerId;
    private String orderId;
    private String reason;

    public VoucherDetailResponse(VoucherDetail detail) {
        this.id = detail.getId();
        this.usageStatus = detail.getUsageStatus();
        this.usedDate = detail.getUsedDate();
        this.reason = detail.getReason();
        // Lấy ID khách hàng an toàn (nếu chưa dùng thì lấy trong customer, dùng rồi thì lấy trong order)
        if (detail.getCustomer() != null) {
            this.customerId = detail.getCustomer().getId();
        } else if (detail.getOrder() != null && detail.getOrder().getCustomer() != null) {
            this.customerId = detail.getOrder().getCustomer().getId();
        }

        // Lấy ID đơn hàng nếu đã sử dụng
        if (detail.getOrder() != null) {
            this.orderId = detail.getOrder().getId();
        }
    }
}
