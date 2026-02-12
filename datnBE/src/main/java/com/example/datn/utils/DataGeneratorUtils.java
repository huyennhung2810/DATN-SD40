package com.example.datn.utils;

import java.security.SecureRandom;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class DataGeneratorUtils {
    // Bộ ký tự để sinh mật khẩu ngẫu nhiên
    private static final String CHAR_LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String CHAR_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String NUMBER = "0123456789";
    private static final String OTHER_CHAR = "!@#$%&*";

    private static final String PASSWORD_ALLOW_BASE = CHAR_LOWER + CHAR_UPPER + NUMBER + OTHER_CHAR;
    private static final SecureRandom random = new SecureRandom();

    // 1. Hàm sinh mật khẩu ngẫu nhiên (8-12 ký tự, đủ chữ hoa, thường, số, ký đặc biệt)
    public static String generateRandomPassword(int length) {
        if (length < 8) length = 8;

        // Đảm bảo mật khẩu có ít nhất 1 ký tự mỗi loại để vượt qua validator của bạn
        StringBuilder password = new StringBuilder();
        password.append(CHAR_LOWER.charAt(random.nextInt(CHAR_LOWER.length())));
        password.append(CHAR_UPPER.charAt(random.nextInt(CHAR_UPPER.length())));
        password.append(NUMBER.charAt(random.nextInt(NUMBER.length())));
        password.append(OTHER_CHAR.charAt(random.nextInt(OTHER_CHAR.length())));

        for (int i = 4; i < length; i++) {
            password.append(PASSWORD_ALLOW_BASE.charAt(random.nextInt(PASSWORD_ALLOW_BASE.length())));
        }

        // Trộn ngẫu nhiên các ký tự để tránh lộ vị trí cố định
        List<Character> letters = password.chars().mapToObj(c -> (char) c).collect(Collectors.toList());
        Collections.shuffle(letters);

        return letters.stream().map(String::valueOf).collect(Collectors.joining());
    }

    // 2. Hàm sinh Mã nhân viên dựa trên tên (Ví dụ: Nguyễn Văn An -> anv001)
    // Cần truyền vào số thứ tự từ Database để đảm bảo không trùng
    public static String generateStaffCode(String fullName, long count) {
        String shortName = NameUtils.generateShortName(fullName);
        // Định dạng mã: tên viết tắt + số thứ tự (ví dụ anv001, anv002)
        return String.format("%s%03d", shortName, count + 1);
    }


    //Mã otp
    public static String generateOTP() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000); // Sinh số từ 100000 đến 999999
        return String.valueOf(otp);
    }
}
