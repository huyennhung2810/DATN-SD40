package com.example.datn.core.client.product.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Immutable result of price calculation for a product or variant.
 * All monetary values are guaranteed non-null.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductPricingResult {

    /**
     * ID of the selected (cheapest) variant.
     */
    private String variantId;

    /**
     * Original price of the selected variant (salePrice from ProductDetail).
     * Never null; returns BigDecimal.ZERO if no valid variant.
     */
    private BigDecimal originalPrice;

    /**
     * Final price shown to customer.
     * - If hasActiveSaleCampaign=true: discounted price
     * - Otherwise: equals originalPrice
     * Never null.
     */
    private BigDecimal displayPrice;

    /**
     * True if the selected variant has an active discount campaign applied.
     */
    private boolean hasActiveSaleCampaign;

    /**
     * Absolute discount amount (originalPrice - displayPrice).
     * Zero if no active campaign.
     */
    private BigDecimal discountAmount;

    /**
     * Discount percentage (e.g. 10 for 10%).
     * Null if no active campaign.
     */
    private BigDecimal discountPercent;

    /**
     * True if the product has at least one valid variant.
     */
    private boolean hasValidVariant;

    /**
     * Safe factory: returns a result indicating no valid variant found.
     */
    public static ProductPricingResult noVariant() {
        return ProductPricingResult.builder()
                .variantId(null)
                .originalPrice(BigDecimal.ZERO)
                .displayPrice(BigDecimal.ZERO)
                .hasActiveSaleCampaign(false)
                .discountAmount(BigDecimal.ZERO)
                .discountPercent(null)
                .hasValidVariant(false)
                .build();
    }
}
