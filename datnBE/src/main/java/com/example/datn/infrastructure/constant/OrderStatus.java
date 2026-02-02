package com.example.datn.infrastructure.constant;

import lombok.Getter;

@Getter
public enum OrderStatus {
    PENDING("Chờ xác nhận", "#FFC107", 1),
    CONFIRMED("Đã xác nhận", "#0D6EFD", 2),
    PACKAGING("Đang đóng gói", "#17A2B8", 3),
    SHIPPING("Đang vận chuyển", "#6F42C1", 4),
    DELIVERY_FAILED("Giao hàng thất bại", "#E74C3C", 5),
    COMPLETED("Đã hoàn thành", "#198754", 6),
    CANCELED("Đã huỷ", "#DC3545", 7),
    RETURNED("Đã trả hàng", "#FD7E14", 8);

    private final String label;   // Hiển thị UI
    private final String color;   // Màu badge / chart
    private final int order;      // Thứ tự hiển thị

    OrderStatus(String label, String color, int order) {
        this.label = label;
        this.color = color;
        this.order = order;
    }

    public static OrderStatus fromName(String name) {
        for (OrderStatus status : OrderStatus.values()) {
            if (status.name().equalsIgnoreCase(name)) return status;
        }
        return PENDING;
    }
}
