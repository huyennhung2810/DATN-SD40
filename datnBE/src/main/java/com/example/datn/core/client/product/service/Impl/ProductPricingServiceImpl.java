package com.example.datn.core.client.product.service.Impl;

import com.example.datn.core.client.product.service.ActiveDiscountInfo;
import com.example.datn.core.client.product.service.ProductPricingResult;
import com.example.datn.core.client.product.service.ProductPricingRules;
import com.example.datn.core.client.product.service.ProductPricingService;
import com.example.datn.entity.ProductDetail;
import com.example.datn.infrastructure.constant.EntityStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

/**
 * Implementation of ProductPricingService.
 *
 * Business rule (strict):
 *   Step 1 – Filter valid variants: ACTIVE status, quantity > 0, salePrice != null
 *   Step 2 – Pick variant with SMALLEST original price (salePrice)
 *   Step 3 – Apply discount of THAT variant only
 *   Step 4 – Do NOT pick a different variant because its discounted price is lower
 *   Step 5 – No vouchers / coupons here
 */
@Service
public class ProductPricingServiceImpl implements ProductPricingService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    /**
     * Calculate display price for a product's full variant list.
     * Implements the "cheapest-by-original-price" rule.
     */
    @Override
    public ProductPricingResult calculateDisplayPrice(
            List<ProductDetail> productDetails,
            Map<String, ActiveDiscountInfo> activeDiscounts) {

        if (productDetails == null || productDetails.isEmpty()) {
            return ProductPricingResult.noVariant();
        }

        // Step 1: Filter valid variants
        List<ProductDetail> validVariants = productDetails.stream()
                .filter(this::isValidVariant)
                .toList();

        if (validVariants.isEmpty()) {
            return ProductPricingResult.noVariant();
        }

        // Step 2: Pick variant with lowest ORIGINAL price (salePrice)
        ProductDetail cheapestVariant = validVariants.stream()
                .min(Comparator.comparing(
                        pd -> pd.getSalePrice() != null ? pd.getSalePrice() : ZERO,
                        Comparator.nullsLast(BigDecimal::compareTo)))
                .orElse(null);

        if (cheapestVariant == null) {
            return ProductPricingResult.noVariant();
        }

        return toPricingResult(cheapestVariant, activeDiscounts);
    }

    /**
     * Calculate display price for a single variant.
     */
    @Override
    public ProductPricingResult calculateVariantPrice(
            ProductDetail detail,
            ActiveDiscountInfo discountInfo) {

        if (!isValidVariant(detail)) {
            return ProductPricingResult.noVariant();
        }

        return toPricingResult(detail,
                discountInfo != null ? Map.of(detail.getId(), discountInfo) : Map.of());
    }

    /**
     * Convert a selected variant + discount map into a ProductPricingResult.
     * The variant has already been selected as the cheapest by original price.
     */
    private ProductPricingResult toPricingResult(
            ProductDetail variant,
            Map<String, ActiveDiscountInfo> activeDiscounts) {

        BigDecimal originalPrice = variant.getSalePrice() != null
                ? variant.getSalePrice()
                : ZERO;

        ActiveDiscountInfo info = activeDiscounts != null ? activeDiscounts.get(variant.getId()) : null;
        BigDecimal displayPrice = ProductPricingRules.resolveFinalPrice(originalPrice, info);
        if (displayPrice == null) {
            displayPrice = originalPrice;
        }
        boolean hasCampaign = ProductPricingRules.hasActiveDiscount(originalPrice, info);
        BigDecimal discountAmount = ProductPricingRules.resolveDiscountAmount(originalPrice, info);
        BigDecimal discountPercent = ProductPricingRules.resolveDisplayPercent(originalPrice, info);

        return ProductPricingResult.builder()
                .variantId(variant.getId())
                .originalPrice(originalPrice)
                .displayPrice(displayPrice)
                .hasActiveSaleCampaign(hasCampaign)
                .discountAmount(discountAmount)
                .discountPercent(discountPercent)
                .hasValidVariant(true)
                .build();
    }

    /**
     * A variant is considered valid for pricing if:
     * - status == ACTIVE
     * - quantity > 0 (has stock)
     * - salePrice != null
     */
    private boolean isValidVariant(ProductDetail pd) {
        if (pd == null) return false;
        if (pd.getStatus() != EntityStatus.ACTIVE) return false;
        if (pd.getQuantity() == null || pd.getQuantity() <= 0) return false;
        if (pd.getSalePrice() == null) return false;
        return true;
    }
}
