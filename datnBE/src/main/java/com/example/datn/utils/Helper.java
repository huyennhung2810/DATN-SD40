package com.example.datn.utils;

import com.example.datn.core.common.base.PageableRequest;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.PaginationConstant;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;

import java.text.Normalizer;
import java.text.NumberFormat;
import java.util.Locale;
import java.util.Random;
import java.util.regex.Pattern;

public class Helper {

    // Dùng cho cấu hình Spring Security (ví dụ: /api/admin/**)

    public static String appendWildcard(String url) {
        return url + "/**";
    }

    // Tạo đối tượng Pageable chuẩn cho toàn dự án
    public static Pageable createPageable(PageableRequest request) {
        // Mặc định sắp xếp theo ngày tạo mới nhất
        String sortBy = (request.getSortBy() == null || request.getSortBy().isEmpty())
                ? "createdDate" : request.getSortBy();

        Sort.Direction direction = "ASC".equalsIgnoreCase(request.getOrderBy())
                ? Sort.Direction.ASC : Sort.Direction.DESC;

        int page = Math.max(0, request.getPage());
        int size = (request.getSize() <= 0) ? PaginationConstant.DEFAULT_SIZE : request.getSize();

        return PageRequest.of(page, size, Sort.by(direction, sortBy));
    }

    // Chuyển ResponseObject thành ResponseEntity để trả về cho Frontend
    public static ResponseEntity<?> createResponseEntity(ResponseObject<?> responseObject) {
        return new ResponseEntity<>(responseObject, responseObject.getStatus());
    }

    // Tạo Slug từ tên máy ảnh (Ví dụ: "Sony A7 Mark IV" -> "sony-a7-mark-iv")
    // Rất quan trọng cho SEO website bán hàng.
    public static String generateSlug(String input) {
        if (input == null || input.isEmpty()) return "";

        // 1. Chuyển sang chữ thường và loại bỏ dấu tiếng Việt chuyên sâu
        String normalized = Normalizer.normalize(input.toLowerCase(), Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String slug = pattern.matcher(normalized).replaceAll("");

        // 2. Xử lý riêng chữ đ
        slug = slug.replace('đ', 'd').replace('Đ', 'D');

        // 3. Thay thế khoảng trắng và ký tự đặc biệt bằng dấu gạch ngang
        slug = slug.replaceAll("[^a-z0-9\\s-]", "");
        slug = slug.replaceAll("\\s+", "-");
        slug = slug.replaceAll("-+", "-"); // Xóa gạch ngang kép

        return slug.trim();
    }

    // Tạo mã đơn hàng hoặc mã máy ảnh tự động
    public static String generateCode(String prefix) {
        Random random = new Random();
        int number = random.nextInt(900000) + 100000; // Tạo số có 6 chữ số
        return prefix.toUpperCase() + "-" + number;
    }

    // Định dạng tiền tệ VNĐ cho giá máy ảnh
    public static String formatCurrency(Double amount) {
        if (amount == null) return "0 ₫";
        Locale localeVN = new Locale("vi", "VN");
        NumberFormat vncuFormat = NumberFormat.getCurrencyInstance(localeVN);
        return vncuFormat.format(amount);
    }
}
