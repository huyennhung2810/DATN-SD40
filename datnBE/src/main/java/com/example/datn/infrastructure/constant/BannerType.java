package com.example.datn.infrastructure.constant;

public enum BannerType {
    IMAGE("IMAGE", "Banner hình ảnh đơn"),
    HERO("HERO", "Banner dạng hero"),
    SLIDE("SLIDE", "Banner dạng slide/carousel");

    private final String value;
    private final String description;

    BannerType(String value, String description) {
        this.value = value;
        this.description = description;
    }

    public String getValue() {
        return value;
    }

    public String getDescription() {
        return description;
    }

    public static BannerType fromValue(String value) {
        for (BannerType type : BannerType.values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid BannerType: " + value);
    }
}
