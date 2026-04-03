package com.example.datn.core.client.product.service.Impl;

import com.example.datn.core.admin.discountDetail.repository.ADDiscountDetailRepository;
import com.example.datn.core.client.product.model.response.RelatedProductResponse;
import com.example.datn.core.client.product.service.ActiveDiscountInfo;
import com.example.datn.core.client.product.service.ProductPricingResult;
import com.example.datn.core.client.product.service.ProductPricingRules;
import com.example.datn.core.client.product.service.RelatedProductService;
import com.example.datn.entity.*;
import com.example.datn.entity.Product;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.repository.ProductDetailRepository;
import com.example.datn.repository.RelatedProductRepository;
import com.example.datn.repository.TechSpecValueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementation of RelatedProductService.
 *
 * Scoring strategy (total = 100%):
 *   40% – Technical spec similarity  (fixed specs + dynamic specs)
 *   30% – Price proximity
 *   20% – Same category / category group
 *   10% – Same brand
 *
 * Fallback chain (when full tech spec data is missing):
 *   Step 1 → same category  (most targeted)
 *   Step 2 → same brand     (broader)
 *   Step 3 → all active     (final fallback)
 *
 * The method {@link #getRelatedProducts(String, int)} is the main entry point.
 * All private helper methods compute individual score components.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RelatedProductServiceImpl implements RelatedProductService {

    // ============================================================
    // WEIGHTS — adjust these to tune recommendation behaviour
    // ============================================================
    private static final double WEIGHT_TECH_SPEC   = 0.40;
    private static final double WEIGHT_PRICE        = 0.30;
    private static final double WEIGHT_CATEGORY     = 0.20;
    private static final double WEIGHT_BRAND        = 0.10;

    /** Default number of results to return. */
    private static final int DEFAULT_LIMIT          = 8;

    // ============================================================
    // DEPENDENCIES
    // ============================================================
    private final RelatedProductRepository relatedProductRepository;
    private final ProductDetailRepository  productDetailRepository;
    private final TechSpecValueRepository  techSpecValueRepository;
    private final ADDiscountDetailRepository discountDetailRepository;

    // ============================================================
    // MAIN ENTRY POINT
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<RelatedProductResponse> getRelatedProducts(String productId, int limit) {
        if (productId == null || productId.isBlank()) {
            return Collections.emptyList();
        }
        int effectiveLimit = limit > 0 ? limit : DEFAULT_LIMIT;

        // 1. Load the source product
        Optional<Product> sourceOpt = relatedProductRepository.findById(productId);
        if (sourceOpt.isEmpty()) {
            return Collections.emptyList();
        }
        Product source = sourceOpt.get();

        // 2. Load candidate set using fallback chain
        Set<String> excludedIds = new HashSet<>();
        excludedIds.add(productId);
        List<Product> candidates = new ArrayList<>();

        candidates.addAll(collectCandidates(
                source.getProductCategory() != null ? source.getProductCategory().getId() : null,
                source.getBrand() != null ? source.getBrand().getId() : null,
                productId, excludedIds, effectiveLimit * 3));

        if (candidates.size() < effectiveLimit) {
            // Step 2 – same brand
            candidates.addAll(collectCandidatesByBrand(
                    source.getBrand() != null ? source.getBrand().getId() : null,
                    productId, excludedIds, effectiveLimit * 2));
        }

        if (candidates.size() < effectiveLimit) {
            // Step 3 – all active
            candidates.addAll(collectFallbackCandidates(productId, excludedIds, effectiveLimit * 2));
        }

        if (candidates.isEmpty()) {
            return Collections.emptyList();
        }

        // 3. Batch-load pricing data for all candidates + source
        List<String> candidateIds = candidates.stream()
                .map(Product::getId).toList();
        Map<String, ProductPricingResult> pricingMap = buildPricingMap(candidateIds);

        // 4. Batch-load dynamic tech specs for source + candidates
        List<String> allIds = new ArrayList<>();
        allIds.add(productId);
        allIds.addAll(candidateIds);
        Map<String, List<TechSpecValue>> dynamicSpecMap = buildDynamicSpecMap(allIds);

        // 5. Build source profile for scoring
        ProductProfile sourceProfile = buildProfile(source, pricingMap.get(productId), dynamicSpecMap.get(productId));

        // 6. Score every candidate
        List<ScoredCandidate> scored = candidates.stream()
                .map(candidate -> {
                    ProductProfile candidateProfile = buildProfile(candidate, pricingMap.get(candidate.getId()), dynamicSpecMap.get(candidate.getId()));
                    double score = calculateFinalScore(sourceProfile, candidateProfile);
                    List<String> reasons = buildMatchReasons(sourceProfile, candidateProfile, score);
                    return new ScoredCandidate(candidate, candidateProfile, score, reasons);
                })
                .filter(sc -> sc.score > 0)
                .sorted(Comparator.comparingDouble(ScoredCandidate::getScore).reversed())
                .toList();

        // 7. Build response (top-N)
        return scored.stream()
                .limit(effectiveLimit)
                .map(sc -> toResponse(sc, pricingMap.get(sc.candidate.getId())))
                .toList();
    }

    // ============================================================
    // CANDIDATE COLLECTION
    // ============================================================

    private List<Product> collectCandidates(
            String categoryId, String brandId, String currentId,
            Set<String> excludedIds, int limit) {
        if (categoryId == null) return Collections.emptyList();
        List<Product> result = relatedProductRepository.findCandidatesByCategory(
                categoryId, currentId, EntityStatus.ACTIVE, PageRequest.of(0, limit));
        result.forEach(p -> excludedIds.add(p.getId()));
        return result;
    }

    private List<Product> collectCandidatesByBrand(
            String brandId, String currentId,
            Set<String> excludedIds, int limit) {
        if (brandId == null) return Collections.emptyList();
        List<Product> result = relatedProductRepository.findCandidatesByBrand(
                brandId, currentId, EntityStatus.ACTIVE, PageRequest.of(0, limit));
        result.forEach(p -> excludedIds.add(p.getId()));
        return result;
    }

    private List<Product> collectFallbackCandidates(
            String currentId, Set<String> excludedIds, int limit) {
        List<Product> result = relatedProductRepository.findFallbackCandidates(
                currentId, EntityStatus.ACTIVE, PageRequest.of(0, limit));
        result.forEach(p -> excludedIds.add(p.getId()));
        return result;
    }

    // ============================================================
    // PRICING MAP
    // ============================================================

    private Map<String, ProductPricingResult> buildPricingMap(List<String> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return Collections.emptyMap();
        }

        // Fetch all valid variants for these products
        List<ProductDetail> allDetails = productDetailRepository.findValidByProductIds(productIds);
        if (allDetails.isEmpty()) {
            return Collections.emptyMap();
        }

        // Group variants by product ID
        Map<String, List<ProductDetail>> byProduct = allDetails.stream()
                .collect(Collectors.groupingBy(pd -> pd.getProduct().getId()));

        // Batch fetch active discounts for all variants
        List<String> detailIds = allDetails.stream()
                .map(ProductDetail::getId)
                .collect(Collectors.toList());
        long now = System.currentTimeMillis();
        Map<String, ActiveDiscountInfo> discountMap = parseDiscountRows(
                discountDetailRepository.findActiveDiscountsByProductDetailIds(detailIds, now));

        // Compute pricing result per product
        Map<String, ProductPricingResult> result = new HashMap<>();
        for (Map.Entry<String, List<ProductDetail>> entry : byProduct.entrySet()) {
            String pid = entry.getKey();
            List<ProductDetail> details = entry.getValue();
            result.put(pid, computeProductPricing(details, discountMap));
        }
        return result;
    }

    private ProductPricingResult computeProductPricing(
            List<ProductDetail> details, Map<String, ActiveDiscountInfo> discountMap) {
        if (details == null || details.isEmpty()) {
            return noPricing();
        }
        // Pick cheapest-by-original-price variant
        ProductDetail cheapest = details.stream()
                .filter(pd -> pd.getStatus() == EntityStatus.ACTIVE
                           && pd.getQuantity() != null && pd.getQuantity() > 0
                           && pd.getSalePrice() != null)
                .min(Comparator.comparing(pd -> pd.getSalePrice()))
                .orElse(null);

        if (cheapest == null) {
            return noPricing();
        }

        BigDecimal original = cheapest.getSalePrice();
        ActiveDiscountInfo info = discountMap.get(cheapest.getId());
        BigDecimal display = ProductPricingRules.resolveFinalPrice(original, info);
        if (display == null) display = original;
        boolean hasCampaign = ProductPricingRules.hasActiveDiscount(original, info);
        BigDecimal discountAmt = ProductPricingRules.resolveDiscountAmount(original, info);
        BigDecimal discountPct = ProductPricingRules.resolveDisplayPercent(original, info);

        return ProductPricingResult.builder()
                .variantId(cheapest.getId())
                .originalPrice(original)
                .displayPrice(display)
                .hasActiveSaleCampaign(hasCampaign)
                .discountAmount(discountAmt)
                .discountPercent(discountPct)
                .hasValidVariant(true)
                .build();
    }

    private ProductPricingResult noPricing() {
        return ProductPricingResult.builder()
                .hasValidVariant(false)
                .build();
    }

    private Map<String, ActiveDiscountInfo> parseDiscountRows(List<Object[]> rows) {
        Map<String, ActiveDiscountInfo> map = new HashMap<>();
        if (rows == null) return map;
        for (Object[] row : rows) {
            if (row == null || row.length < 4) continue;
            String id = (String) row[0];
            map.putIfAbsent(id, ActiveDiscountInfo.fromQueryRow(row));
        }
        return map;
    }

    // ============================================================
    // DYNAMIC TECH SPEC MAP
    // ============================================================

    private Map<String, List<TechSpecValue>> buildDynamicSpecMap(List<String> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return Collections.emptyMap();
        }
        List<TechSpecValue> allValues = techSpecValueRepository.findByProductIdsWithDefinition(productIds);
        return allValues.stream()
                .collect(Collectors.groupingBy(v -> v.getProduct().getId()));
    }

    // ============================================================
    // PRODUCT PROFILE
    // ============================================================

    /**
     * Lightweight snapshot of a product used for scoring.
     */
    private record ProductProfile(
            String productId,
            String categoryId,
            String brandId,
            FixedSpecProfile fixedSpecs,
            Map<String, DynamicSpecEntry> dynamicSpecs,
            BigDecimal displayPrice,
            boolean hasStock
    ) {}

    private record FixedSpecProfile(
            String sensorType,
            String lensMount,
            String resolution,
            String iso,
            String processor,
            String imageFormat,
            String videoFormat
    ) {}

    private record DynamicSpecEntry(
            String definitionId,
            String definitionName,
            TechSpecDefinition.DataType dataType,
            String valueText,
            Double valueNumber,
            Boolean valueBoolean,
            Double valueMin,
            Double valueMax
    ) {}

    private ProductProfile buildProfile(Product product, ProductPricingResult pricing, List<TechSpecValue> dynamicValues) {
        TechSpec ts = product.getTechSpec();
        FixedSpecProfile fixed = new FixedSpecProfile(
                trim(ts != null ? ts.getSensorType() : null),
                trim(ts != null ? ts.getLensMount() : null),
                trim(ts != null ? ts.getResolution() : null),
                trim(ts != null ? ts.getIso() : null),
                trim(ts != null ? ts.getProcessor() : null),
                trim(ts != null ? ts.getImageFormat() : null),
                trim(ts != null ? ts.getVideoFormat() : null)
        );

        Map<String, DynamicSpecEntry> dynMap = new HashMap<>();
        if (dynamicValues != null) {
            for (TechSpecValue v : dynamicValues) {
                TechSpecDefinition def = v.getTechSpecDefinition();
                if (def == null) continue;
                String key = trim(def.getName());
                if (key == null) key = def.getId();
                dynMap.put(key, new DynamicSpecEntry(
                        def.getId(),
                        key,
                        def.getDataType(),
                        trim(v.getValueText()),
                        v.getValueNumber(),
                        v.getValueBoolean(),
                        v.getValueMin(),
                        v.getValueMax()
                ));
            }
        }

        return new ProductProfile(
                product.getId(),
                product.getProductCategory() != null ? product.getProductCategory().getId() : null,
                product.getBrand() != null ? product.getBrand().getId() : null,
                fixed,
                dynMap,
                pricing != null ? pricing.getDisplayPrice() : null,
                pricing != null && pricing.isHasValidVariant()
        );
    }

    // ============================================================
    // SCORING ENGINE
    // ============================================================

    /**
     * Final weighted score in [0.0, 1.0].
     */
    private double calculateFinalScore(ProductProfile source, ProductProfile candidate) {
        if (!candidate.hasStock) return 0.0;

        double techScore   = calculateTechSpecScore(source, candidate);
        double priceScore  = calculatePriceScore(source, candidate);
        double catScore    = calculateCategoryScore(source, candidate);
        double brandScore  = calculateBrandScore(source, candidate);

        return WEIGHT_TECH_SPEC * techScore
             + WEIGHT_PRICE     * priceScore
             + WEIGHT_CATEGORY  * catScore
             + WEIGHT_BRAND     * brandScore;
    }

    // ---- TECH SPEC SCORE (40%) ----

    /**
     * Computes tech-spec similarity score (0..1) based on:
     * - 7 fixed fields (exact + partial match)
     * - Dynamic specs (same definition, similar value)
     */
    private double calculateTechSpecScore(ProductProfile source, ProductProfile candidate) {
        if (source.fixedSpecs == null && source.dynamicSpecs.isEmpty()) {
            return 0.5; // No source data — give benefit of the doubt
        }

        double totalWeight = 0.0;
        double earnedWeight = 0.0;

        // ---- Fixed specs ----
        earnedWeight += fixedSpecScore("sensorType",  source.fixedSpecs.sensorType(),  candidate.fixedSpecs.sensorType());  totalWeight += 1.0;
        earnedWeight += fixedSpecScore("lensMount",   source.fixedSpecs.lensMount(),   candidate.fixedSpecs.lensMount());   totalWeight += 1.0;
        earnedWeight += fixedSpecScore("resolution",  source.fixedSpecs.resolution(),  candidate.fixedSpecs.resolution());  totalWeight += 1.0;
        earnedWeight += fixedSpecScore("iso",         source.fixedSpecs.iso(),         candidate.fixedSpecs.iso());         totalWeight += 1.0;
        earnedWeight += fixedSpecScore("processor",   source.fixedSpecs.processor(),   candidate.fixedSpecs.processor());   totalWeight += 1.0;
        earnedWeight += fixedSpecScore("imageFormat", source.fixedSpecs.imageFormat(), candidate.fixedSpecs.imageFormat()); totalWeight += 1.0;
        earnedWeight += fixedSpecScore("videoFormat", source.fixedSpecs.videoFormat(), candidate.fixedSpecs.videoFormat()); totalWeight += 1.0;

        // ---- Dynamic specs ----
        Set<String> allDefKeys = new HashSet<>();
        allDefKeys.addAll(source.dynamicSpecs.keySet());
        allDefKeys.addAll(candidate.dynamicSpecs.keySet());

        for (String key : allDefKeys) {
            DynamicSpecEntry srcSpec = source.dynamicSpecs.get(key);
            DynamicSpecEntry candSpec = candidate.dynamicSpecs.get(key);
            double dynScore = dynamicSpecScore(srcSpec, candSpec);
            earnedWeight += dynScore;
            totalWeight += 1.0;
        }

        if (totalWeight == 0) return 0.5;
        return Math.min(1.0, earnedWeight / totalWeight);
    }

    /**
     * Scores a single fixed spec field.
     * Exact match = 1.0, partial/contains = 0.5, no match = 0.0.
     */
    private double fixedSpecScore(String fieldName, String sourceVal, String candidateVal) {
        String s = normalize(sourceVal);
        String c = normalize(candidateVal);

        if (s == null && c == null) return 1.0;  // Both absent — neutral
        if (s == null || c == null) return 0.3;  // One absent

        if (s.equals(c)) return 1.0;             // Exact match

        // Partial / contains match (important for camera type, mount type, etc.)
        if (s.length() > 2 && c.contains(s)) return 0.8;
        if (c.length() > 2 && s.contains(c)) return 0.8;

        // Numeric-like resolution match (e.g. "24.2 MP" vs "24.2MP" vs "24.2")
        if (isNumericMatch(s, c)) return 0.9;

        return 0.0;
    }

    /**
     * Scores a dynamic spec pair.
     */
    private double dynamicSpecScore(DynamicSpecEntry src, DynamicSpecEntry cand) {
        if (src == null && cand == null) return 1.0;
        if (src == null || cand == null) return 0.3;

        TechSpecDefinition.DataType dt = src.dataType();
        if (dt == null) dt = (cand != null ? cand.dataType() : TechSpecDefinition.DataType.TEXT);

        return switch (dt) {
            case BOOLEAN -> booleanScore(src, cand);
            case NUMBER  -> numberScore(src, cand);
            case RANGE    -> rangeScore(src, cand);
            case ENUM, TEXT -> textScore(src.valueText(), cand.valueText());
            default -> textScore(src.valueText(), cand.valueText());
        };
    }

    private double booleanScore(DynamicSpecEntry src, DynamicSpecEntry cand) {
        Boolean a = src.valueBoolean();
        Boolean b = cand.valueBoolean();
        if (a == null && b == null) return 1.0;
        if (a == null || b == null) return 0.3;
        return a.equals(b) ? 1.0 : 0.0;
    }

    private double numberScore(DynamicSpecEntry src, DynamicSpecEntry cand) {
        Double a = src.valueNumber();
        Double b = cand.valueNumber();
        if (a == null && b == null) return 1.0;
        if (a == null || b == null) return 0.3;
        if (a == 0) return b == 0 ? 1.0 : 0.0;
        double ratio = Math.min(a, b) / Math.max(a, b);
        return Math.max(0.0, ratio);
    }

    private double rangeScore(DynamicSpecEntry src, DynamicSpecEntry cand) {
        double sMin = src.valueMin() != null ? src.valueMin() : Double.MAX_VALUE;
        double sMax = src.valueMax() != null ? src.valueMax() : -Double.MAX_VALUE;
        double cMin = cand.valueMin() != null ? cand.valueMin() : Double.MAX_VALUE;
        double cMax = cand.valueMax() != null ? cand.valueMax() : -Double.MAX_VALUE;

        // Overlap ratio
        double overlap = Math.max(0, Math.min(sMax, cMax) - Math.max(sMin, cMin));
        double union   = Math.max(sMax, cMax) - Math.min(sMin, cMin);
        if (union == 0) return 1.0;
        return Math.max(0.0, overlap / union);
    }

    private double textScore(String srcVal, String candVal) {
        String s = normalize(srcVal);
        String c = normalize(candVal);
        if (s == null && c == null) return 1.0;
        if (s == null || c == null) return 0.3;
        if (s.equals(c)) return 1.0;
        if (s.length() > 2 && c.contains(s)) return 0.7;
        if (c.length() > 2 && s.contains(c)) return 0.7;
        return 0.0;
    }

    // ---- PRICE SCORE (30%) ----

    /**
     * Scores price proximity between source and candidate.
     * Deviation <= 10% → score 1.0
     * Deviation <= 20% → score 0.8
     * Deviation <= 30% → score 0.5
     * Deviation > 30%  → score 0.2
     */
    private double calculatePriceScore(ProductProfile source, ProductProfile candidate) {
        BigDecimal srcPrice = source.displayPrice();
        BigDecimal candPrice = candidate.displayPrice();

        if (srcPrice == null && candPrice == null) return 0.8; // Both unknown — neutral
        if (srcPrice == null || candPrice == null) return 0.4;
        if (srcPrice.compareTo(BigDecimal.ZERO) == 0) return 0.4;

        BigDecimal higher = srcPrice.max(candPrice);
        BigDecimal lower  = srcPrice.min(candPrice);
        double deviation = higher.subtract(lower)
                .divide(srcPrice, 4, RoundingMode.HALF_UP)
                .doubleValue();

        if (deviation <= 0.10) return 1.0;
        if (deviation <= 0.20) return 0.8;
        if (deviation <= 0.30) return 0.5;
        if (deviation <= 0.50) return 0.2;
        return 0.0;
    }

    // ---- CATEGORY SCORE (20%) ----

    /**
     * Same category = 1.0, otherwise 0.0.
     */
    private double calculateCategoryScore(ProductProfile source, ProductProfile candidate) {
        if (source.categoryId() == null || candidate.categoryId() == null) return 0.5;
        return source.categoryId().equals(candidate.categoryId()) ? 1.0 : 0.0;
    }

    // ---- BRAND SCORE (10%) ----

    /**
     * Same brand = 1.0, otherwise 0.0.
     */
    private double calculateBrandScore(ProductProfile source, ProductProfile candidate) {
        if (source.brandId() == null || candidate.brandId() == null) return 0.3;
        return source.brandId().equals(candidate.brandId()) ? 1.0 : 0.0;
    }

    // ============================================================
    // MATCH REASONS
    // ============================================================

    /**
     * Builds human-readable reasons why this candidate matched.
     */
    private List<String> buildMatchReasons(ProductProfile source, ProductProfile candidate, double score) {
        if (score < 0.1) return Collections.emptyList();

        List<String> reasons = new ArrayList<>();

        // Category
        if (source.categoryId() != null && source.categoryId().equals(candidate.categoryId())) {
            reasons.add("Cùng danh mục sản phẩm");
        }

        // Brand
        if (source.brandId() != null && source.brandId().equals(candidate.brandId())) {
            reasons.add("Cùng thương hiệu");
        }

        // Tech spec reasons — camera-specific
        addIfMatch(reasons, "Cùng loại cảm biến",
                source.fixedSpecs.sensorType(), candidate.fixedSpecs.sensorType());

        addIfMatch(reasons, "Cùng ngàm ống kính",
                source.fixedSpecs.lensMount(), candidate.fixedSpecs.lensMount());

        addIfMatch(reasons, "Cùng độ phân giải",
                source.fixedSpecs.resolution(), candidate.fixedSpecs.resolution());

        addIfMatch(reasons, "Cùng bộ xử lý ảnh",
                source.fixedSpecs.processor(), candidate.fixedSpecs.processor());

        addIfMatch(reasons, "Cùng định dạng video",
                source.fixedSpecs.videoFormat(), candidate.fixedSpecs.videoFormat());

        // Price segment
        BigDecimal srcPrice = source.displayPrice();
        if (srcPrice != null && srcPrice.compareTo(BigDecimal.ZERO) > 0) {
            String segment = priceSegmentLabel(srcPrice);
            if (segment != null) {
                reasons.add(segment);
            }
        }

        // Dynamic spec — shared spec names
        for (String key : source.dynamicSpecs.keySet()) {
            DynamicSpecEntry srcSpec = source.dynamicSpecs.get(key);
            DynamicSpecEntry candSpec = candidate.dynamicSpecs.get(key);
            if (srcSpec != null && candSpec != null) {
                double dynScore = dynamicSpecScore(srcSpec, candSpec);
                if (dynScore >= 0.8) {
                    String defName = srcSpec.definitionName();
                    if (defName != null && defName.length() > 2) {
                        reasons.add("Thông số \"" + defName + "\" tương đương");
                    }
                }
            }
        }

        // Deduplicate + limit
        return reasons.stream().distinct().limit(3).toList();
    }

    private void addIfMatch(List<String> reasons, String label, String sourceVal, String candidateVal) {
        String s = normalize(sourceVal);
        String c = normalize(candidateVal);
        if (s != null && !s.isEmpty() && c != null && !c.isEmpty() && (s.equals(c) || s.contains(c) || c.contains(s))) {
            reasons.add(label);
        }
    }

    private String priceSegmentLabel(BigDecimal price) {
        if (price == null) return null;
        double millions = price.doubleValue() / 1_000_000;
        if (millions <= 5)   return "Tầm giá dưới 5 triệu";
        if (millions <= 15)  return "Tầm giá 5 – 15 triệu";
        if (millions <= 30)  return "Tầm giá 15 – 30 triệu";
        if (millions <= 50)  return "Tầm giá 30 – 50 triệu";
        return "Tầm giá trên 50 triệu";
    }

    // ============================================================
    // RESPONSE MAPPING
    // ============================================================

    private RelatedProductResponse toResponse(ScoredCandidate sc, ProductPricingResult pricing) {
        Product p = sc.candidate();
        String thumbnail = null;
        if (p.getImages() != null && !p.getImages().isEmpty()) {
            thumbnail = p.getImages().get(0).getUrl();
        }

        RelatedProductResponse.TechSummary techSummary = RelatedProductResponse.TechSummary.builder()
                .sensorType(sc.candidateProfile.fixedSpecs.sensorType())
                .lensMount(sc.candidateProfile.fixedSpecs.lensMount())
                .resolution(sc.candidateProfile.fixedSpecs.resolution())
                .processor(sc.candidateProfile.fixedSpecs.processor())
                .videoFormat(sc.candidateProfile.fixedSpecs.videoFormat())
                .iso(sc.candidateProfile.fixedSpecs.iso())
                .imageFormat(sc.candidateProfile.fixedSpecs.imageFormat())
                .build();

        BigDecimal originalPrice = pricing != null ? pricing.getOriginalPrice() : null;
        BigDecimal displayPrice  = pricing != null ? pricing.getDisplayPrice() : null;
        BigDecimal discountPct  = pricing != null ? pricing.getDiscountPercent() : null;
        Boolean hasCampaign     = pricing != null ? pricing.isHasActiveSaleCampaign() : false;

        return RelatedProductResponse.builder()
                .productId(p.getId())
                .productName(p.getName())
                .thumbnail(thumbnail)
                .brand(p.getBrand() != null ? p.getBrand().getName() : null)
                .brandId(p.getBrand() != null ? p.getBrand().getId() : null)
                .category(p.getProductCategory() != null ? p.getProductCategory().getName() : null)
                .categoryId(p.getProductCategory() != null ? p.getProductCategory().getId() : null)
                .originalPrice(originalPrice)
                .displayPrice(displayPrice)
                .hasActiveSaleCampaign(hasCampaign)
                .discountPercent(discountPct)
                .techSummary(techSummary)
                .matchReasons(sc.matchReasons())
                .build();
    }

    // ============================================================
    // INTERNAL DATA CLASS
    // ============================================================

    private record ScoredCandidate(Product candidate, ProductProfile candidateProfile, double score, List<String> matchReasons) {
        public double getScore() { return score; }
    }

    // ============================================================
    // UTILITIES
    // ============================================================

    private static String normalize(String s) {
        if (s == null) return null;
        s = s.trim().toLowerCase()
                .replace("　", " ")
                .replaceAll("\\s+", " ");
        return s.isEmpty() ? null : s;
    }

    private static String trim(String s) {
        if (s == null) return null;
        s = s.trim();
        return s.isEmpty() ? null : s;
    }

    private static boolean isNumericMatch(String a, String b) {
        if (a == null || b == null) return false;
        double d1 = parseNumericPart(a);
        double d2 = parseNumericPart(b);
        if (d1 <= 0 || d2 <= 0) return false;
        double ratio = Math.min(d1, d2) / Math.max(d1, d2);
        return ratio >= 0.90;
    }

    private static double parseNumericPart(String s) {
        if (s == null) return 0;
        String num = s.replaceAll("[^0-9.]", "");
        try {
            return Double.parseDouble(num);
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
