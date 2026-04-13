package com.example.datn.core.client.product.service;

import com.example.datn.entity.ProductDetail;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Thông tin đợt giảm giá đang active cho một {@link ProductDetail}.
 * <p>
 * Nguồn: bảng {@code discount_detail} join {@code discount}.
 */
public final class ActiveDiscountInfo {
    private final BigDecimal discountPercent;
    private final BigDecimal priceAfter;
    private final BigDecimal priceBefore;

    ActiveDiscountInfo(
            /** % giảm từ đợt (vd: 10 = 10%). Ưu tiên dùng để tính giá từ giá niêm yết hiện tại. */
            BigDecimal discountPercent,
            /** Giá sau giảm lưu snapshot khi tạo chi tiết đợt (có thể lệch nếu sau đó đổi sale_price). */
            BigDecimal priceAfter,
            /** Giá trước giảm lưu snapshot — dùng để khớp với sale_price hiện tại khi không có % hoặc làm fallback. */
            BigDecimal priceBefore
    ) {
        this.discountPercent = discountPercent;
        this.priceAfter = priceAfter;
        this.priceBefore = priceBefore;
    }

    public BigDecimal discountPercent() {
        return discountPercent;
    }

    public BigDecimal priceAfter() {
        return priceAfter;
    }

    public BigDecimal priceBefore() {
        return priceBefore;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj == this) return true;
        if (obj == null || obj.getClass() != this.getClass()) return false;
        var that = (ActiveDiscountInfo) obj;
        return Objects.equals(this.discountPercent, that.discountPercent) &&
                Objects.equals(this.priceAfter, that.priceAfter) &&
                Objects.equals(this.priceBefore, that.priceBefore);
    }

    @Override
    public int hashCode() {
        return Objects.hash(discountPercent, priceAfter, priceBefore);
    }

    @Override
    public String toString() {
        return "ActiveDiscountInfo[" +
                "discountPercent=" + discountPercent + ", " +
                "priceAfter=" + priceAfter + ", " +
                "priceBefore=" + priceBefore + ']';
    }

    public static ActiveDiscountInfo fromQueryRow(Object[] row) {
        return new ActiveDiscountInfo(
                (BigDecimal) row[1],
                (BigDecimal) row[2],
                (BigDecimal) row[3]
        );
    }
}
