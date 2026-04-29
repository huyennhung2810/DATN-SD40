package com.example.datn.infrastructure.constant;

import lombok.Getter;

@Getter
public enum ChangeRequestStatus {
    CHO_XU_LY("Chờ xử lý"),
    DA_DUYET("Đã duyệt"),
    TU_CHOI("Từ chối");

    private final String description;

    ChangeRequestStatus(String description) {
        this.description = description;
    }
}
