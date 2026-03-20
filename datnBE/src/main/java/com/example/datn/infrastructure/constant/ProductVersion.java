package com.example.datn.infrastructure.constant;

import lombok.Getter;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Enum đại diện cho "Phiên bản" của máy ảnh Canon.
 * Đây là dimension bắt buộc cấp 1 cho biến thể sản phẩm.
 *
 * LEVEL 1: Chỉ hỗ trợ 3 giá trị cố định:
 * - BODY_ONLY: Body Only (chỉ thân máy)
 * - KIT_18_45: Kit 18-45mm (thân máy + lens 18-45mm)
 * - KIT_18_150: Kit 18-150mm (thân máy + lens 18-150mm)
 *
 * Chuẩn bị mở rộng cho LEVEL 2:
 * - Thêm bundle phụ kiện
 * - Thêm memory card bundle
 * - Tự động generate SKU
 */
@Getter
public enum ProductVersion {

    BODY_ONLY("Body Only", "BO"),
    KIT_18_45("Kit 18-45", "K45"),
    KIT_18_150("Kit 18-150", "K150");

    private final String displayName;
    private final String shortCode;

    ProductVersion(String displayName, String shortCode) {
        this.displayName = displayName;
        this.shortCode = shortCode;
    }

    /**
     * Lấy danh sách tất cả tên enum (dùng cho validation)
     */
    public static List<String> getAllValues() {
        return Arrays.stream(ProductVersion.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }

    /**
     * Lấy display name tiếng Việt
     */
    public static String getDisplayName(ProductVersion version) {
        if (version == null) {
            return BODY_ONLY.getDisplayName(); // Default fallback
        }
        return version.getDisplayName();
    }

    /**
     * Kiểm tra giá trị có hợp lệ không
     */
    public static boolean isValid(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }
        try {
            ProductVersion.valueOf(value);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Parse từ String sang enum (null-safe)
     */
    public static ProductVersion fromString(String value) {
        if (value == null || value.isBlank()) {
            return BODY_ONLY; // Default
        }
        try {
            return ProductVersion.valueOf(value);
        } catch (IllegalArgumentException e) {
            return BODY_ONLY; // Default fallback
        }
    }

    /**
     * Format tên phiên bản đầy đủ cho hiển thị
     * Format: {Version} / {Color} / {Storage}
     * Ví dụ: Body Only / Đen / 128GB
     */
    public static String formatFullName(String version, String colorName, String storageName) {
        String versionDisplay = getDisplayName(fromString(version));
        StringBuilder sb = new StringBuilder(versionDisplay);

        if (colorName != null && !colorName.isBlank()) {
            sb.append(" / ").append(colorName);
        }

        if (storageName != null && !storageName.isBlank()) {
            sb.append(" / ").append(storageName);
        }

        return sb.toString();
    }
}
