package com.example.datn.utils;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class DateConverter {
    // Múi giờ Việt Nam
    private static final ZoneId ZONE_ID = ZoneId.of("Asia/Ho_Chi_Minh");

    // Các mẫu định dạng (Pattern) chuẩn cho website
    private static final DateTimeFormatter UI_FORMATTER = DateTimeFormatter.ofPattern("MMM dd 'lúc' HH:mm").withLocale(new Locale("vi", "VN"));
    private static final DateTimeFormatter MAIL_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy 'lúc' HH:mm:ss");
    private static final DateTimeFormatter SHORT_FORMATTER = DateTimeFormatter.ofPattern("dd 'tháng' MM");

    /**
     * Hiển thị trên giao diện (Ví dụ: Lịch sử đơn hàng)
     * Kết quả: "Th01 05 lúc 22:30"
     */
    public static String convertDateToString(long dateInMillis) {
        return Instant.ofEpochMilli(dateInMillis)
                .atZone(ZONE_ID)
                .format(UI_FORMATTER);
    }

    /**
     * Dùng cho Email xác nhận đặt mua máy ảnh
     * Kết quả: "05/01/2026 lúc 22:30:15"
     */
    public static String convertDateToStringMail(long dateInMillis) {
        return Instant.ofEpochMilli(dateInMillis)
                .atZone(ZONE_ID)
                .format(MAIL_FORMATTER);
    }
}
