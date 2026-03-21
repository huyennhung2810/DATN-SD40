package com.example.datn.core.client.product.service;

import com.example.datn.entity.ProductDetail;

import java.util.List;
import java.util.Map;

/**
 * Shared pricing calculation logic for client-facing product display.
 * Single source of truth for all pricing computations.
 *
 * Business rules:
 * 1. Filter valid variants (active, has stock, has valid price)
 * 2. Pick the variant with the LOWEST original price (salePrice)
 * 3. Apply discount campaign to THAT variant only (if any)
 * 4. Do NOT pick a different variant just because its discounted price is lower
 * 5. Do NOT apply vouchers
 */
public interface ProductPricingService {

    /**
     * Calculate the display price info for a single product (list view).
     * Returns the pricing details of the cheapest original-price variant,
     * with its discount (if any) applied.
     *
     * @param productDetails all variants of the product
     * @param activeDiscounts map productDetailId → thông tin đợt giảm (%, snapshot…)
     * @return pricing result, never null
     */
    ProductPricingResult calculateDisplayPrice(
            List<ProductDetail> productDetails,
            Map<String, ActiveDiscountInfo> activeDiscounts
    );

    /**
     * Calculate the display price for a single variant (detail view).
     *
     * @param detail the variant
     * @param discountInfo thông tin đợt giảm, hoặc null nếu không có
     * @return pricing result, never null
     */
    ProductPricingResult calculateVariantPrice(ProductDetail detail, ActiveDiscountInfo discountInfo);
}
