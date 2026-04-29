package com.example.datn.core.client.product.service;

import com.example.datn.core.client.product.service.Impl.ProductPricingServiceImpl;
import com.example.datn.entity.ProductDetail;
import com.example.datn.infrastructure.constant.EntityStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for ProductPricingService.
 * Tests the core business rule:
 *   1. Filter valid variants (ACTIVE, stock > 0, price != null)
 *   2. Pick the variant with the LOWEST original price (salePrice)
 *   3. Apply discount of THAT variant only
 *   4. Do NOT pick a variant because its discounted price is lower
 */
class ProductPricingServiceImplTest {

    private ProductPricingServiceImpl pricingService;

    @BeforeEach
    void setUp() {
        pricingService = new ProductPricingServiceImpl();
    }

    // ---- Test helpers ----

    private ProductDetail makeVariant(String id, BigDecimal salePrice, int quantity, EntityStatus status) {
        ProductDetail pd = new ProductDetail();
        pd.setId(id);
        pd.setSalePrice(salePrice);
        pd.setQuantity(quantity);
        pd.setStatus(status);
        return pd;
    }

    // =====================================================
    // CASE 1: 2 variants, no discount → cheapest is B (10M)
    // =====================================================
    @Test
    @DisplayName("Case 1: 2 variants, no discount → display 10M (cheapest B)")
    void case1_twoVariantsNoDiscount_cheapestPrice() {
        ProductDetail variantB = makeVariant("B", new BigDecimal("10000000"), 5, EntityStatus.ACTIVE);
        ProductDetail variantC = makeVariant("C", new BigDecimal("12000000"), 3, EntityStatus.ACTIVE);
        List<ProductDetail> variants = Arrays.asList(variantB, variantC);
        Map<String, ActiveDiscountInfo> noDiscounts = Collections.emptyMap();

        ProductPricingResult result = pricingService.calculateDisplayPrice(variants, noDiscounts);

        assertTrue(result.isHasValidVariant());
        assertFalse(result.isHasActiveSaleCampaign());
        assertEquals("B", result.getVariantId());
        assertEquals(new BigDecimal("10000000"), result.getOriginalPrice());
        assertEquals(new BigDecimal("10000000"), result.getDisplayPrice());
        assertEquals(BigDecimal.ZERO, result.getDiscountAmount());
        assertNull(result.getDiscountPercent());
    }

    // =====================================================
    // CASE 2: 2 variants, cheapest has 10% discount → display 9M (from % × current sale price)
    // =====================================================
    @Test
    @DisplayName("Case 2: B=10M(-10%) + C=12M → display 9M (B with discount)")
    void case2_cheapestHasDiscount_appliesDiscount() {
        ProductDetail variantB = makeVariant("B", new BigDecimal("10000000"), 5, EntityStatus.ACTIVE);
        ProductDetail variantC = makeVariant("C", new BigDecimal("12000000"), 3, EntityStatus.ACTIVE);
        List<ProductDetail> variants = Arrays.asList(variantB, variantC);
        Map<String, ActiveDiscountInfo> discounts = Map.of(
                "B", new ActiveDiscountInfo(new BigDecimal("10"), new BigDecimal("9000000"), new BigDecimal("10000000"))
        );

        ProductPricingResult result = pricingService.calculateDisplayPrice(variants, discounts);

        assertTrue(result.isHasValidVariant());
        assertTrue(result.isHasActiveSaleCampaign());
        assertEquals("B", result.getVariantId());
        assertEquals(new BigDecimal("10000000"), result.getOriginalPrice());
        assertEquals(new BigDecimal("9000000"), result.getDisplayPrice());
        assertEquals(new BigDecimal("1000000"), result.getDiscountAmount());
        assertNotNull(result.getDiscountPercent());
    }

    // =====================================================
    // CASE 3: Expensive variant has discount, cheap variant does NOT
    // → STILL pick cheap variant (B), NO discount applied
    // =====================================================
    @Test
    @DisplayName("Case 3: B=10M(no discount) + C=12M(-30%) → still pick B at 10M (NOT C at 8.4M)")
    void case3_expensivVariantHasDiscount_cheapestByOriginalPrice() {
        ProductDetail variantB = makeVariant("B", new BigDecimal("10000000"), 5, EntityStatus.ACTIVE);
        ProductDetail variantC = makeVariant("C", new BigDecimal("12000000"), 3, EntityStatus.ACTIVE);
        List<ProductDetail> variants = Arrays.asList(variantB, variantC);
        Map<String, ActiveDiscountInfo> discounts = Map.of(
                "C", new ActiveDiscountInfo(new BigDecimal("30"), new BigDecimal("8400000"), new BigDecimal("12000000"))
        );

        ProductPricingResult result = pricingService.calculateDisplayPrice(variants, discounts);

        // Critical assertion: we MUST pick B (cheapest by original price)
        assertEquals("B", result.getVariantId(), "Must pick B because B has the lowest original price");
        assertFalse(result.isHasActiveSaleCampaign(), "B has no discount");
        assertEquals(new BigDecimal("10000000"), result.getDisplayPrice(),
                "Display price must be B's original price, NOT C's discounted price (8.4M)");
        assertEquals(new BigDecimal("10000000"), result.getOriginalPrice());
        assertEquals(BigDecimal.ZERO, result.getDiscountAmount());
    }

    // =====================================================
    // CASE 4: No valid variants → safe empty result
    // =====================================================
    @Test
    @DisplayName("Case 4: No valid variants → safe result (no crash, zero prices)")
    void case4_noValidVariants_noCrash() {
        ProductDetail inactive = makeVariant("X", new BigDecimal("5000000"), 0, EntityStatus.INACTIVE);
        ProductDetail noStock = makeVariant("Y", new BigDecimal("6000000"), 0, EntityStatus.ACTIVE);
        ProductDetail noPrice = new ProductDetail();
        noPrice.setId("Z");
        noPrice.setQuantity(5);
        noPrice.setStatus(EntityStatus.ACTIVE);
        // salePrice is null
        List<ProductDetail> variants = Arrays.asList(inactive, noStock, noPrice);
        Map<String, ActiveDiscountInfo> discounts = Collections.emptyMap();

        ProductPricingResult result = pricingService.calculateDisplayPrice(variants, discounts);

        assertFalse(result.isHasValidVariant());
        assertEquals(BigDecimal.ZERO, result.getDisplayPrice());
        assertEquals(BigDecimal.ZERO, result.getOriginalPrice());
        assertFalse(result.isHasActiveSaleCampaign());
    }

    // =====================================================
    // CASE 5: Snapshot price_after = original → no real discount
    // =====================================================
    @Test
    @DisplayName("Case 5: priceAfter not less than original → treated as no discount")
    void case5_discountNotLessThanOriginal_noDiscount() {
        ProductDetail variantB = makeVariant("B", new BigDecimal("10000000"), 5, EntityStatus.ACTIVE);
        List<ProductDetail> variants = List.of(variantB);
        Map<String, ActiveDiscountInfo> badDiscount = Map.of(
                "B", new ActiveDiscountInfo(null, new BigDecimal("10000000"), new BigDecimal("10000000"))
        );

        ProductPricingResult result = pricingService.calculateDisplayPrice(variants, badDiscount);

        assertFalse(result.isHasActiveSaleCampaign());
        assertEquals(new BigDecimal("10000000"), result.getDisplayPrice());
    }

    // =====================================================
    // CASE 6: Single variant — legacy path: priceBefore matches current sale price
    // =====================================================
    @Test
    @DisplayName("Case 6: Single variant with legacy snapshot discount → correct display")
    void case6_singleVariantWithDiscount_calculatesCorrectly() {
        ProductDetail variant = makeVariant("V1", new BigDecimal("15000000"), 10, EntityStatus.ACTIVE);
        List<ProductDetail> variants = List.of(variant);
        Map<String, ActiveDiscountInfo> discounts = Map.of(
                "V1", new ActiveDiscountInfo(null, new BigDecimal("12000000"), new BigDecimal("15000000"))
        );

        ProductPricingResult result = pricingService.calculateDisplayPrice(variants, discounts);

        assertTrue(result.isHasValidVariant());
        assertTrue(result.isHasActiveSaleCampaign());
        assertEquals("V1", result.getVariantId());
        assertEquals(new BigDecimal("15000000"), result.getOriginalPrice());
        assertEquals(new BigDecimal("12000000"), result.getDisplayPrice());
        assertEquals(new BigDecimal("3000000"), result.getDiscountAmount());
        assertNotNull(result.getDiscountPercent());
    }

    // =====================================================
    // CASE 7: Stale price_after (admin changed sale_price after campaign) → ignore snapshot
    // =====================================================
    @Test
    @DisplayName("Case 7: price_before snapshot does not match current sale_price → no fake discount")
    void case7_stalePriceAfter_ignoredUnlessPercent() {
        ProductDetail variant = makeVariant("V1", new BigDecimal("65440650"), 5, EntityStatus.ACTIVE);
        List<ProductDetail> variants = List.of(variant);
        // Old snapshot was for 60M list price; current list price is 65.4M — must NOT show 59.4M as promo
        Map<String, ActiveDiscountInfo> discounts = Map.of(
                "V1", new ActiveDiscountInfo(null, new BigDecimal("59491500"), new BigDecimal("60000000"))
        );

        ProductPricingResult result = pricingService.calculateDisplayPrice(variants, discounts);

        assertTrue(result.isHasValidVariant());
        assertFalse(result.isHasActiveSaleCampaign());
        assertEquals(new BigDecimal("65440650"), result.getDisplayPrice());
        assertEquals(BigDecimal.ZERO, result.getDiscountAmount());
    }

    // =====================================================
    // EDGE: null/empty product details list
    // =====================================================
    @Test
    @DisplayName("Edge: null product details → no crash")
    void edge_nullProductDetails_noCrash() {
        ProductPricingResult result = pricingService.calculateDisplayPrice(null, Collections.emptyMap());
        assertFalse(result.isHasValidVariant());
    }

    @Test
    @DisplayName("Edge: empty product details list → no crash")
    void edge_emptyProductDetails_noCrash() {
        ProductPricingResult result = pricingService.calculateDisplayPrice(Collections.emptyList(), Collections.emptyMap());
        assertFalse(result.isHasValidVariant());
    }

    // =====================================================
    // EDGE: single variant, no discount
    // =====================================================
    @Test
    @DisplayName("Edge: single variant no discount → display original price")
    void edge_singleVariantNoDiscount() {
        ProductDetail variant = makeVariant("V1", new BigDecimal("25000000"), 2, EntityStatus.ACTIVE);
        List<ProductDetail> variants = List.of(variant);

        ProductPricingResult result = pricingService.calculateDisplayPrice(variants, Collections.emptyMap());

        assertTrue(result.isHasValidVariant());
        assertFalse(result.isHasActiveSaleCampaign());
        assertEquals("V1", result.getVariantId());
        assertEquals(new BigDecimal("25000000"), result.getDisplayPrice());
        assertEquals(new BigDecimal("25000000"), result.getOriginalPrice());
    }

    // =====================================================
    // EDGE: variant with null salePrice is filtered out
    // =====================================================
    @Test
    @DisplayName("Edge: variant with null salePrice is filtered out, cheapest remaining picked")
    void edge_nullSalePriceFiltered() {
        ProductDetail noPrice = new ProductDetail();
        noPrice.setId("Z");
        noPrice.setSalePrice(null);
        noPrice.setQuantity(5);
        noPrice.setStatus(EntityStatus.ACTIVE);

        ProductDetail valid = makeVariant("Y", new BigDecimal("8000000"), 3, EntityStatus.ACTIVE);
        List<ProductDetail> variants = Arrays.asList(noPrice, valid);

        ProductPricingResult result = pricingService.calculateDisplayPrice(variants, Collections.emptyMap());

        assertTrue(result.isHasValidVariant());
        assertEquals("Y", result.getVariantId());
        assertEquals(new BigDecimal("8000000"), result.getDisplayPrice());
    }
}
