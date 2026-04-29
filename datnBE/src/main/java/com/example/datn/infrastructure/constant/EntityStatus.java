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

    public static List<String> getAllStatus() {
        return Arrays.stream(EntityStatus.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }

    public static String getAllStatusString() {
        return Arrays.stream(EntityStatus.values())
                .map(Enum::name)
                .collect(Collectors.joining(", "));
    }

    public static EntityStatus fromValue(Integer value) {
        if (value == null) {
            return ACTIVE;
        }
        return value == 1 ? ACTIVE : INACTIVE;
    }
}
