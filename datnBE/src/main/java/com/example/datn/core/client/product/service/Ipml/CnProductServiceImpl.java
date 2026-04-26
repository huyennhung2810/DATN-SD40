package com.example.datn.core.client.product.service.Ipml;

import com.example.datn.core.admin.discountDetail.repository.ADDiscountDetailRepository;
import com.example.datn.core.client.product.model.response.CnProductResponse;
import com.example.datn.core.client.product.model.response.CnVariantResponse;
import com.example.datn.core.client.product.service.CnProductService;
import com.example.datn.core.client.product.service.ActiveDiscountInfo;
import com.example.datn.core.client.product.service.ProductPricingResult;
import com.example.datn.core.client.product.service.ProductPricingRules;
import com.example.datn.core.client.product.service.ProductPricingService;
import com.example.datn.entity.Product;
import com.example.datn.entity.ProductDetail;
import com.example.datn.entity.ProductImage;
import com.example.datn.entity.TechSpec;
import com.example.datn.entity.TechSpecDefinition;
import com.example.datn.entity.TechSpecValue;
import com.example.datn.repository.ProductDetailRepository;
import com.example.datn.repository.ProductImageRepository;
import com.example.datn.repository.ProductRepository;
import com.example.datn.repository.TechSpecValueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CnProductServiceImpl implements CnProductService {

    private final ProductRepository productRepository;
    private final ProductDetailRepository productDetailRepository;
    private final ProductImageRepository productImageRepository;
    private final ADDiscountDetailRepository discountDetailRepository;
    private final ProductPricingService pricingService;
    private final TechSpecValueRepository techSpecValueRepository;

    @Override
    @Transactional(readOnly = true)
    public CnProductResponse getProductDetailById(String productId) {
        // 1. Tìm thông tin Sản phẩm cha (+ tech_spec JOIN FETCH để map thông số cố định)
        Product product = productRepository.findByIdWithTechSpec(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm!"));

        // 2. Lấy danh sách ảnh của sản phẩm
        List<ProductImage> images = productImageRepository.findByProduct_Id(productId);
        List<String> imageUrls = images.stream()
                .map(ProductImage::getUrl)
                .collect(Collectors.toList());

        // 3. Lấy danh sách các biến thể (ProductDetail)
        List<ProductDetail> details = productDetailRepository.findByProduct_Id(productId);

        if (details == null || details.isEmpty()) {
            CnProductResponse response = new CnProductResponse();
            response.setId(product.getId());
            response.setName(product.getName());
            response.setDescription(product.getDescription());
            response.setDisplayPrice(null);
            response.setOriginalPrice(null);
            response.setHasActiveSaleCampaign(false);
            response.setDiscountAmount(BigDecimal.ZERO);
            response.setDiscountPercent(null);
            response.setImages(imageUrls);
            response.setVariants(Collections.emptyList());
            response.setTechSpec(buildTechSpecDetail(product));
            return response;
        }

        // 4. Batch fetch active discounts cho tất cả variants
        long now = System.currentTimeMillis();
        List<String> detailIds = details.stream()
                .map(ProductDetail::getId)
                .collect(Collectors.toList());

        Map<String, ActiveDiscountInfo> activeDiscounts = parseActiveDiscountRows(
                discountDetailRepository.findActiveDiscountsByProductDetailIds(detailIds, now));

        // 5. Tính giá hiển thị cho sản phẩm (dùng shared service)
        ProductPricingResult productPricing = pricingService.calculateDisplayPrice(details, activeDiscounts);

        // 6. Map variants kèm discount
        List<CnVariantResponse> variants = details.stream()
                .map(detail -> mapToVariantResponse(detail, activeDiscounts))
                .collect(Collectors.toList());

        // 7. Build TechSpecDetail (fixed + dynamic specs) — wrapped in try-catch to never crash endpoint
        CnProductResponse.TechSpecDetail techSpecDetail;
        try {
            techSpecDetail = buildTechSpecDetail(product);
        } catch (Exception e) {
            techSpecDetail = new CnProductResponse.TechSpecDetail();
        }

        // 8. Build Response
        CnProductResponse response = new CnProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setDisplayPrice(productPricing.getDisplayPrice());
        response.setOriginalPrice(productPricing.getOriginalPrice());
        response.setCheapestVariantId(productPricing.getVariantId());
        response.setHasActiveSaleCampaign(productPricing.isHasActiveSaleCampaign());
        response.setDiscountAmount(productPricing.getDiscountAmount());
        response.setDiscountPercent(productPricing.getDiscountPercent());
        response.setImages(imageUrls);
        response.setVariants(variants);
        response.setTechSpec(techSpecDetail);
        return response;
    }

    /**
     * Xây dựng TechSpecDetail chứa cả fixed specs và dynamic specs.
     * Sử dụng 1 query duy nhất với JOIN FETCH để lấy TechSpecValue cùng
     * TechSpecDefinition và TechSpecGroup, tránh N+1.
     */
    private CnProductResponse.TechSpecDetail buildTechSpecDetail(Product product) {
        CnProductResponse.TechSpecDetail detail = new CnProductResponse.TechSpecDetail();

        // --- Fixed Specs ---
        CnProductResponse.FixedSpecs fixedSpecs = buildFixedSpecs(product.getTechSpec());
        detail.setFixedSpecs(fixedSpecs);

        // --- Dynamic Specs ---
        List<CnProductResponse.DynamicSpecGroup> dynamicGroups = buildDynamicSpecGroups(product.getId());
        detail.setDynamicSpecs(dynamicGroups);

        return detail;
    }

    /**
     * Map 7 trường cố định từ TechSpec entity.
     */
    private CnProductResponse.FixedSpecs buildFixedSpecs(TechSpec ts) {
        CnProductResponse.FixedSpecs fixed = new CnProductResponse.FixedSpecs();
        if (ts == null) {
            return fixed;
        }
        fixed.setSensorType(trimToNull(ts.getSensorType()));
        fixed.setLensMount(trimToNull(ts.getLensMount()));
        fixed.setResolution(trimToNull(ts.getResolution()));
        fixed.setIso(trimToNull(ts.getIso()));
        fixed.setProcessor(trimToNull(ts.getProcessor()));
        fixed.setImageFormat(trimToNull(ts.getImageFormat()));
        fixed.setVideoFormat(trimToNull(ts.getVideoFormat()));
        return fixed;
    }

    /**
     * Lấy TechSpecValue cho sản phẩm (1 query), sau đó nhóm theo TechSpecGroup
     * và map sang DynamicSpecGroup.
     * Sắp xếp: group theo displayOrder, item trong group theo displayOrder.
     */
    private List<CnProductResponse.DynamicSpecGroup> buildDynamicSpecGroups(String productId) {
        try {
            List<TechSpecValue> values = techSpecValueRepository.findByProductIdWithDefinition(productId);
            if (values == null || values.isEmpty()) {
                return Collections.emptyList();
            }

            Map<String, CnProductResponse.DynamicSpecGroup> groupMap = new LinkedHashMap<>();

            for (TechSpecValue val : values) {
                TechSpecDefinition def = val.getTechSpecDefinition();
                if (def == null) {
                    continue;
                }
                String groupId = def.getTechSpecGroup() != null ? def.getTechSpecGroup().getId() : "UNGROUPED";
                String groupName = def.getTechSpecGroup() != null ? def.getTechSpecGroup().getName() : "Khác";
                Integer groupOrder = def.getTechSpecGroup() != null ? def.getTechSpecGroup().getDisplayOrder() : null;
                final Integer effectiveGroupOrder = groupOrder != null ? groupOrder : Integer.MAX_VALUE;

                groupMap.computeIfAbsent(groupId, k -> new CnProductResponse.DynamicSpecGroup(groupId, groupName, effectiveGroupOrder));

                String displayValue = resolveDisplayValue(val, def);

                CnProductResponse.DynamicSpecGroup group = groupMap.get(groupId);
                if (group == null) continue;
                group.getItems().add(new CnProductResponse.SpecItem(
                        def.getId(),
                        trimToNull(def.getName()),
                        displayValue,
                        trimToNull(def.getUnit()),
                        def.getDisplayOrder() != null ? def.getDisplayOrder() : null
                ));
            }

            return groupMap.values().stream()
                    .sorted((a, b) -> {
                        int aOrder = a.getGroupOrder() != null ? a.getGroupOrder() : Integer.MAX_VALUE;
                        int bOrder = b.getGroupOrder() != null ? b.getGroupOrder() : Integer.MAX_VALUE;
                        return Integer.compare(aOrder, bOrder);
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("buildDynamicSpecGroups failed for productId={}: {}", productId, e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Chuyển đổi giá trị TechSpecValue sang chuỗi hiển thị theo dataType.
     */
    private String resolveDisplayValue(TechSpecValue val, TechSpecDefinition def) {
        if (val == null || def == null) {
            return null;
        }

        switch (def.getDataType()) {
            case BOOLEAN:
                return Boolean.TRUE.equals(val.getValueBoolean()) ? "Có" : "Không";

            case NUMBER:
                if (val.getValueNumber() != null) {
                    return formatNumber(val.getValueNumber()) + (def.getUnit() != null ? " " + def.getUnit() : "");
                }
                String numFallback = trimToNull(val.getDisplayValue());
                if (numFallback != null) {
                    return numFallback;
                }
                return trimToNull(val.getValueText());

            case RANGE:
                if (val.getValueMin() != null || val.getValueMax() != null) {
                    StringBuilder sb = new StringBuilder();
                    if (val.getValueMin() != null) {
                        sb.append(formatNumber(val.getValueMin()));
                    }
                    sb.append(" - ");
                    if (val.getValueMax() != null) {
                        sb.append(formatNumber(val.getValueMax()));
                    }
                    if (def.getUnit() != null) {
                        sb.append(" ").append(def.getUnit());
                    }
                    return sb.toString();
                }
                return null;

            case ENUM:
            case TEXT:
            default:
                String display = trimToNull(val.getDisplayValue());
                if (display != null) {
                    return display;
                }
                return trimToNull(val.getValueText());
        }
    }

    private String formatNumber(Double value) {
        if (value == null) return "";
        if (value == value.longValue()) {
            return String.valueOf(value.longValue());
        }
        return String.format("%.1f", value).replaceAll("0+$", "").replaceAll("\\.$", "");
    }

    private String trimToNull(String s) {
        if (s == null) return null;
        s = s.trim();
        return s.isEmpty() ? null : s;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CnVariantResponse> getVariantsByProductId(String productId) {
        List<ProductDetail> details = productDetailRepository.findByProduct_Id(productId);
        if (details == null || details.isEmpty()) {
            return Collections.emptyList();
        }

        long now = System.currentTimeMillis();
        List<String> detailIds = details.stream()
                .map(ProductDetail::getId)
                .collect(Collectors.toList());

        Map<String, ActiveDiscountInfo> activeDiscounts = parseActiveDiscountRows(
                discountDetailRepository.findActiveDiscountsByProductDetailIds(detailIds, now));

        return details.stream()
                .map(detail -> mapToVariantResponse(detail, activeDiscounts))
                .collect(Collectors.toList());
    }

    private Map<String, ActiveDiscountInfo> parseActiveDiscountRows(List<Object[]> rows) {
        Map<String, ActiveDiscountInfo> map = new HashMap<>();
        if (rows == null) {
            return map;
        }
        for (Object[] row : rows) {
            if (row == null || row.length < 4) {
                continue;
            }
            String id = (String) row[0];
            map.putIfAbsent(id, ActiveDiscountInfo.fromQueryRow(row));
        }
        return map;
    }

    private CnVariantResponse mapToVariantResponse(
            ProductDetail detail,
            Map<String, ActiveDiscountInfo> activeDiscounts) {

        CnVariantResponse variant = new CnVariantResponse();
        variant.setId(detail.getId());
        variant.setName(detail.getVersion());

        BigDecimal salePrice = detail.getSalePrice() != null ? detail.getSalePrice() : BigDecimal.ZERO;
        variant.setSalePrice(salePrice);
        variant.setOriginalPrice(salePrice);

        ActiveDiscountInfo info = activeDiscounts != null ? activeDiscounts.get(detail.getId()) : null;
        BigDecimal displayPrice = ProductPricingRules.resolveFinalPrice(salePrice, info);
        if (displayPrice == null) {
            displayPrice = salePrice;
        }
        boolean hasCampaign = ProductPricingRules.hasActiveDiscount(salePrice, info);

        if (hasCampaign) {
            variant.setDiscountedPrice(displayPrice);
            variant.setDisplayPrice(displayPrice);
            variant.setHasActiveSaleCampaign(true);
            try {
                var activeDiscount = discountDetailRepository.getActiveDiscountByProductDetailId(detail.getId());
                if (activeDiscount != null && activeDiscount.getDiscount() != null) {
                    variant.setAppliedPromotionName(activeDiscount.getDiscount().getName());
                } else {
                    variant.setAppliedPromotionName(null);
                }
            } catch (Exception e) {
                variant.setAppliedPromotionName(null);
            }
        } else {
            variant.setDiscountedPrice(null);
            variant.setDisplayPrice(salePrice);
            variant.setHasActiveSaleCampaign(false);
        }

        variant.setStock(detail.getQuantity() != null ? detail.getQuantity() : 0);
        return variant;
    }
}
