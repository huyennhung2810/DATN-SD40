package com.example.datn.infrastructure.constant;

import lombok.Getter;

@Getter
public enum OrderStatus {
    CHO_XAC_NHAN(0),    // PENDING - Chờ xác nhận
    DA_XAC_NHAN(1),     // CONFIRMED - Đã xác nhận
    CHO_GIAO(2),        // PACKING - Đóng gói / Chờ giao
    DANG_GIAO(3),       // HANDOVER + SHIPPING - Đã bàn giao & Đang giao
    GIAO_HANG_KHONG_THANH_CONG(4), // FAILED_DELIVERY - Giao hàng thất bại
    HOAN_THANH(5),      // DELIVERED - Hoàn thành
    DA_HUY(6),          // CANCELLED - Đã hủy
    LUU_TAM(7),         // Lưu tạm
    DA_HOAN_HANG(8);    // RETURNED - Hàng đã hoàn về kho

    private final int order;

    OrderStatus(int order) {
        this.order = order;
    }

    /**
     * Trả về true nếu trạng thái cho phép cập nhật thông tin giao hàng trực tiếp.
     * Chỉ cho phép khi trạng thái < DANG_GIAO (tức CHƯA bàn giao cho đơn vị vận chuyển).
     */
    public boolean allowDirectShippingUpdate() {
        return this.order < DANG_GIAO.order;
    }

    /**
     * Trả về true nếu khách hàng được phép tự sửa địa chỉ/SĐT từ trang của mình.
     * Chỉ cho phép khi đơn hàng còn ở trạng thái CHỜ XÁC NHẬN.
     * Các trạng thái khác phải liên hệ admin.
     */
    public boolean allowCustomerSelfUpdate() {
        return this == CHO_XAC_NHAN;
    }

    /**
     * Trả về true nếu đơn hàng đã bàn giao cho đơn vị vận chuyển.
     * Kể từ trạng thái này, khách hàng không thể cập nhật trực tiếp mà phải tạo yêu cầu thay đổi.
     */
    public boolean isShipped() {
        return this.order >= DANG_GIAO.order && this != LUU_TAM;
    }

    /**
     * Trả về true nếu đơn hàng ở trạng thái terminal (không thể thay đổi).
     * Bao gồm: HOAN_THANH, DA_HUY.
     */
    public boolean isTerminal() {
        return this == HOAN_THANH || this == DA_HUY;
    }

    /**
     * Trả về true nếu đơn hàng đang ở trạng thái tạm khóa mọi thao tác thay đổi.
     */
    public boolean isLocked() {
        return this == HOAN_THANH || this == DA_HUY || this == LUU_TAM;
    }

    /**
     * Lấy text hiển thị tiếng Việt cho trạng thái.
     */
    public String getDisplayText() {
        switch (this) {
            case CHO_XAC_NHAN: return "Chờ xác nhận";
            case DA_XAC_NHAN:  return "Đã xác nhận";
            case CHO_GIAO:     return "Chờ giao hàng";
            case DANG_GIAO:    return "Đang giao hàng";
            case GIAO_HANG_KHONG_THANH_CONG: return "Giao hàng không thành công";
            case HOAN_THANH:   return "Hoàn thành";
            case DA_HUY:       return "Đã hủy";
            case LUU_TAM:      return "Lưu tạm";
            case DA_HOAN_HANG: return "Đã hoàn hàng";
            default:           return this.name();
        }
    }
}
