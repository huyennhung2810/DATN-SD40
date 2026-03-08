package com.example.datn.infrastructure.constant;

public enum LinkTarget {
    SAME_TAB("SAME_TAB", "Mở trong tab hiện tại"),
    NEW_TAB("NEW_TAB", "Mở trong tab mới");

    private final String value;
    private final String description;

    LinkTarget(String value, String description) {
        this.value = value;
        this.description = description;
    }

    public String getValue() {
        return value;
    }

    public String getDescription() {
        return description;
    }

    public static LinkTarget fromValue(String value) {
        for (LinkTarget target : LinkTarget.values()) {
            if (target.value.equalsIgnoreCase(value)) {
                return target;
            }
        }
        return SAME_TAB;
    }
}
