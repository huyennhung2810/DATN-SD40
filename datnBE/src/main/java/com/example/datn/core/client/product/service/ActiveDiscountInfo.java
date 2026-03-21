package com.example.datn.core.client.product.service;

import java.math.BigDecimal;

/**
 * Thông tin đợt giảm giá đang active cho một {@link com.example.datn.entity.ProductDetail}.
 * <p>
 * Nguồn: bảng {@code discount_detail} join {@code discount}.
 */
public record ActiveDiscountInfo(
        /** % giảm từ đợt (vd: 10 = 10%). Ưu tiên dùng để tính giá từ giá niêm yết hiện tại. */
        BigDecimal discountPercent,
        /** Giá sau giảm lưu snapshot khi tạo chi tiết đợt (có thể lệch nếu sau đó đổi sale_price). */
        BigDecimal priceAfter,
        /** Giá trước giảm lưu snapshot — dùng để khớp với sale_price hiện tại khi không có % hoặc làm fallback. */
        BigDecimal priceBefore
) {
    public static ActiveDiscountInfo fromQueryRow(Object[] row) {
        return new ActiveDiscountInfo(
                (BigDecimal) row[1],
                (BigDecimal) row[2],
                (BigDecimal) row[3]
        );
    }
}
