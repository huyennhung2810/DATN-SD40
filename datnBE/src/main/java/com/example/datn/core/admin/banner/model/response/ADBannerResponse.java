package com.example.datn.core.admin.banner.model.response;

import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ADBannerResponse {

    private String id;

    private String code;

    private String title;

    private String slot;

    private String imageUrl;

    private String targetUrl;

    private String altText;

    private Long startAt;

    private Long endAt;

    private Integer priority;

    private String description;

    private EntityStatus status;

    private Long createdAt;

    private Long updatedAt;

    // Slot constants for display
    public static final String SLOT_HOME_HERO = "HOME_HERO";
    public static final String SLOT_HOME_STRIP = "HOME_STRIP";
    public static final String SLOT_SIDEBAR = "SIDEBAR";
    public static final String SLOT_CATEGORY_TOP = "CATEGORY_TOP";

    public static String getSlotName(String slot) {
        return switch (slot) {
            case SLOT_HOME_HERO -> "Banner chính (Hero)";
            case SLOT_HOME_STRIP -> "Banner dải ngang";
            case SLOT_SIDEBAR -> "Banner Sidebar";
            case SLOT_CATEGORY_TOP -> "Banner đầu danh mục";
            default -> slot;
        };
    }
}

