package com.example.datn.infrastructure.constant;

import lombok.Getter;

@Getter
public enum OrderStatus {
    PENDING("Chờ xử lý", "#FFC107", 1),
    CONFIRMED("Đã xác nhận", "#0D6EFD", 2),
    SHIPPING("Đang vận chuyển", "#6F42C1", 3),
    COMPLETED("Đã hoàn thành", "#198754", 4),
    CANCELED("Đã huỷ", "#DC3545", 5),
    RETURNED("Đã trả hàng", "#FD7E14", 6),
    UNKNOWN("Không xác định", "#000000", 0);

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
        return PENDING; // Default
    }
}
