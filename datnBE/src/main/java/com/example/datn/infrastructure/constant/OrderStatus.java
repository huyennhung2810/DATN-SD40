package com.example.datn.infrastructure.constant;

import lombok.Getter;

@Getter
public enum OrderStatus {
    CHO_XAC_NHAN(0),    // Pending
    DA_XAC_NHAN(1),     // Confirmed
    CHO_GIAO(2),        // Waiting for delivery
    DANG_GIAO(3),       // Shipping
    GIAO_HANG_KHONG_THANH_CONG(4), // Failed delivery
    HOAN_THANH(5),      // Completed
    DA_HUY(6),          // Cancelled
    LUU_TAM(7),         // Draft/temporary
    DA_HOAN_HANG(8);    // Returned

    private final int order;

    OrderStatus(int order) {
        this.order = order;
    }

    public boolean allowDirectShippingUpdate() {
        return this.order < DANG_GIAO.order;
    }

    public boolean allowCustomerSelfUpdate() {
        return this == CHO_XAC_NHAN;
    }

    public boolean isShipped() {
        return this.order >= DANG_GIAO.order && this != LUU_TAM;
    }

    public boolean isTerminal() {
        return this == HOAN_THANH || this == DA_HUY || this == DA_HOAN_HANG;
    }

    public boolean isLocked() {
        return this == HOAN_THANH || this == DA_HUY || this == LUU_TAM || this == DA_HOAN_HANG;
    }

    public String getDisplayText() {
        switch (this) {
            case CHO_XAC_NHAN: return "Cho xac nhan";
            case DA_XAC_NHAN: return "Da xac nhan";
            case CHO_GIAO: return "Cho giao hang";
            case DANG_GIAO: return "Dang giao hang";
            case GIAO_HANG_KHONG_THANH_CONG: return "Giao hang khong thanh cong";
            case HOAN_THANH: return "Hoan thanh";
            case DA_HUY: return "Da huy";
            case LUU_TAM: return "Luu tam";
            case DA_HOAN_HANG: return "Da hoan hang";
            default: return this.name();
        }
    }
}
