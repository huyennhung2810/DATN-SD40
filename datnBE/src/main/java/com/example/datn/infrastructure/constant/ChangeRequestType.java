package com.example.datn.infrastructure.constant;

import lombok.Getter;

@Getter
public enum ChangeRequestType {
    UPDATE_ADDRESS("Cập nhật địa chỉ giao hàng"),
    UPDATE_PHONE("Cập nhật số điện thoại người nhận"),
    UPDATE_RECEIVER("Cập nhật tên người nhận");

    private final String description;

    ChangeRequestType(String description) {
        this.description = description;
    }
}
