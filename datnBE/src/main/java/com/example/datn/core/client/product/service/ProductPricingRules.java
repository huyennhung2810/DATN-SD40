package com.example.datn.core.client.product.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Quy tắc tính giá hiển thị client — một nguồn dùng chung cho list / chi tiết / biến thể.
 * <p>
 * <b>Vấn đề đã gặp:</b> {@code originalPrice} lấy từ {@code product_detail.sale_price} (giá niêm yết
 * <i>hiện tại</i>), còn giá đỏ trước đây lấy thẳng {@code discount_detail.price_after} (snapshot lúc tạo đợt).
 * Khi admin đổi {@code sale_price} sau khi tạo khuyến mãi, hai số không cùng cơ sở → nhìn như “có gạch ngang
 * nhưng không giảm đúng”.
 * <p>
 * <b>Cách xử lý:</b>
 * <ol>
 *   <li>Nếu đợt có {@code discount_percent}: giá sau giảm = {@code salePrice × (1 - percent/100)} (làm tròn VND).</li>
 *   <li>Nếu không có %: chỉ dùng {@code price_after} khi {@code price_before} khớp {@code sale_price} hiện tại.</li>
 *   <li>Nếu không thỏa: coi như không áp dụng khuyến mãi (giá đỏ = giá niêm yết).</li>
 * </ol>
 */
public final class ProductPricingRules {

    private static final BigDecimal HUNDRED = new BigDecimal("100");

    private ProductPricingRules() {
    }

    /**
     * Giá cuối sau đợt giảm giá (hoặc bằng salePrice nếu không áp dụng).
     */
    public static BigDecimal resolveFinalPrice(BigDecimal salePrice, ActiveDiscountInfo info) {
        if (salePrice == null) {
            return null;
        }
        if (info == null) {
            return salePrice;
        }
        // 1) Ưu tiên % đợt × giá niêm yết hiện tại
        if (info.discountPercent() != null && info.discountPercent().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal factor = BigDecimal.ONE.subtract(
                    info.discountPercent().divide(HUNDRED, 10, RoundingMode.HALF_UP));
            BigDecimal computed = salePrice.multiply(factor).setScale(0, RoundingMode.HALF_UP);
            if (computed.compareTo(salePrice) < 0) {
                return computed;
            }
        }
        // 2) Legacy: chỉ tin price_after khi snapshot price_before khớp sale_price hiện tại
        if (info.priceAfter() != null
                && info.priceBefore() != null
                && info.priceBefore().compareTo(salePrice) == 0
                && info.priceAfter().compareTo(salePrice) < 0) {
            return info.priceAfter();
        }
        return salePrice;
    }

    public static boolean hasActiveDiscount(BigDecimal salePrice, ActiveDiscountInfo info) {
        if (salePrice == null) {
            return false;
        }
        BigDecimal fin = resolveFinalPrice(salePrice, info);
        return fin != null && fin.compareTo(salePrice) < 0;
    }

    public static BigDecimal resolveDiscountAmount(BigDecimal salePrice, ActiveDiscountInfo info) {
        if (!hasActiveDiscount(salePrice, info)) {
            return BigDecimal.ZERO;
        }
        return salePrice.subtract(resolveFinalPrice(salePrice, info)).setScale(0, RoundingMode.HALF_UP);
    }

    /**
     * % giảm hiển thị (vd 10.0 cho 10%). Ưu tiên từ đợt; nếu không có thì suy ra từ giá.
     */
    public static BigDecimal resolveDisplayPercent(BigDecimal salePrice, ActiveDiscountInfo info) {
        if (!hasActiveDiscount(salePrice, info)) {
            return null;
        }
        if (info != null && info.discountPercent() != null && info.discountPercent().compareTo(BigDecimal.ZERO) > 0) {
            return info.discountPercent().setScale(1, RoundingMode.HALF_UP);
        }
        BigDecimal fin = resolveFinalPrice(salePrice, info);
        if (salePrice.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }
        return HUNDRED.subtract(fin.multiply(HUNDRED).divide(salePrice, 1, RoundingMode.HALF_UP))
                .setScale(1, RoundingMode.HALF_UP);
    }
}
