package com.example.datn.utils;

import java.text.Normalizer;
import java.util.regex.Pattern;

public class NameUtils {
    // Hàm khử dấu tiếng Việt
    public static String removeAccent(String s) {
        if (s == null) return "";

        // Phân tách các ký tự tổ hợp (ví dụ: á -> a + dấu sắc)
        String temp = Normalizer.normalize(s, Normalizer.Form.NFD);

        // Dùng Regex để loại bỏ các dấu sau khi đã phân tách
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String result = pattern.matcher(temp).replaceAll("");

        // Riêng chữ 'đ' và 'Đ' không xử lý được bằng Normalizer nên phải replace thủ công
        return result.replaceAll("đ", "d").replaceAll("Đ", "D");
    }

    // Hàm tạo tên viết tắt (đã nâng cấp)
    public static String generateShortName(String fullName) {
        if (fullName == null || fullName.isEmpty()) {
            return "";
        }

        // Bước 1: Khử dấu trước khi xử lý logic
        String noAccentName = removeAccent(fullName);

        // Bước 2: Chuẩn hóa và cắt chuỗi
        String[] parts = noAccentName.trim().toLowerCase().split("\\s+");
        StringBuilder shortName = new StringBuilder();

        // Lấy phần tên chính (cuối cùng)
        String lastName = parts[parts.length - 1];
        shortName.append(lastName);

        // Lấy ký tự đầu của các phần còn lại (Họ và Tên đệm)
        for (int i = 0; i < parts.length - 1; i++) {
            shortName.append(parts[i].charAt(0));
        }

        return shortName.toString();
    }
}
