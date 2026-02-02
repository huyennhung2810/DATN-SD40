package com.example.datn.infrastructure.constant;

import lombok.Getter;

@Getter
public enum ResolutionType {
    // Độ phân giải Video (Dùng để lọc sản phẩm)
    VIDEO_8K("7680x4320", "8K UHD"),       // Dành cho Canon EOS R5
    VIDEO_4K("3840x2160", "4K UHD"),       // Tiêu chuẩn máy Mirrorless hiện nay
    VIDEO_FULL_HD("1920x1080", "Full HD"), // Phổ biến nhất
    VIDEO_HD("1280x720", "HD"),

    // Độ phân giải màn hình LCD (Nếu bạn muốn chi tiết hơn)
    LCD_VGA("640x480", "VGA"),
    LCD_WVGA("800x480", "WVGA");

    private final String pixels;
    private final String label;

    ResolutionType(String pixels, String label) {
        this.pixels = pixels;
        this.label = label;
    }

    public static ResolutionType getByPixels(String pixels) {
        for (ResolutionType res : values()) {
            if (res.pixels.equals(pixels)) {
                return res;
            }
        }
        return null;
    }
}
