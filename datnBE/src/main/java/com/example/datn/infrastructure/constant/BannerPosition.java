package com.example.datn.infrastructure.constant;

public enum BannerPosition {
    HOME_HERO("HOME_HERO", "Banner chính trang chủ"),
    HOME_TOP("HOME_TOP", "Banner phía trên trang chủ"),
    HOME_MIDDLE("HOME_MIDDLE", "Banner giữa trang chủ"),
    HOME_BOTTOM("HOME_BOTTOM", "Banner phía dưới trang chủ"),
    SIDEBAR("SIDEBAR", "Banner sidebar"),
    POPUP("POPUP", "Banner popup");

    private final String value;
    private final String description;

    BannerPosition(String value, String description) {
        this.value = value;
        this.description = description;
    }

    public String getValue() {
        return value;
    }

    public String getDescription() {
        return description;
    }

    public static BannerPosition fromValue(String value) {
        for (BannerPosition position : BannerPosition.values()) {
            if (position.value.equalsIgnoreCase(value)) {
                return position;
            }
        }
        throw new IllegalArgumentException("Invalid BannerPosition: " + value);
    }
}
