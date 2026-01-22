package com.example.datn.infrastructure.constant;

import lombok.Getter;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public enum EntityStatus {
    ACTIVE("Hoạt động"),
    INACTIVE("Ngừng hoạt động");

    private final String description;

    EntityStatus(String description) {
        this.description = description;
    }

    //Lấy danh sách tên trạng thái (ACTIVE, INACTIVE)
    public static List<String> getAllStatus() {
        return Arrays.stream(EntityStatus.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }

    //Lấy chuỗi tất cả trạng thái ngăn cách bởi dấu phẩy
    public static String getAllStatusString() {
        return Arrays.stream(EntityStatus.values())
                .map(Enum::name)
                .collect(Collectors.joining(", "));
    }

    //Lấy mô tả tiếng Việt theo enum name
    public static String getDescriptionByStatus(String statusName) {
        return Arrays.stream(EntityStatus.values())
                .filter(status -> status.name().equalsIgnoreCase(statusName))
                .map(EntityStatus::getDescription)
                .findFirst()
                .orElse("Không xác định");
    }
}
