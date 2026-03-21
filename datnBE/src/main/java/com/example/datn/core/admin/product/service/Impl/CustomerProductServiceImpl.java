package com.example.datn.core.admin.product.service.Impl;

import com.example.datn.core.admin.discountDetail.repository.ADDiscountDetailRepository;
import com.example.datn.core.admin.product.model.request.CustomerProductSearchRequest;
import com.example.datn.core.admin.product.model.response.ADProductResponse;
import com.example.datn.core.admin.product.model.response.ADProductVariantResponse;
import com.example.datn.core.admin.product.repository.ADProductRepository;
import com.example.datn.core.admin.product.service.CustomerProductService;
import com.example.datn.core.admin.productdetail.repository.ADProductDetailRepository;
import com.example.datn.core.admin.productimage.repository.ADProductImageRepository;
import com.example.datn.core.admin.serial.model.response.ADSerialResponse;
import com.example.datn.core.admin.techspec.model.response.ADTechSpecResponse;
import com.example.datn.core.client.product.service.ActiveDiscountInfo;
import com.example.datn.core.client.product.service.ProductPricingResult;
import com.example.datn.core.client.product.service.ProductPricingRules;
import com.example.datn.core.client.product.service.ProductPricingService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.entity.ProductDetail;
import com.example.datn.entity.ProductImage;
import com.example.datn.entity.Serial;
import com.example.datn.entity.TechSpec;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.repository.TechSpecRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerProductServiceImpl implements CustomerProductService {

    private final ADProductRepository productRepository;
    private final TechSpecRepository techSpecRepository;
    private final ADProductImageRepository productImageRepository;
    private final ADProductDetailRepository productDetailRepository;
    private final ADDiscountDetailRepository discountDetailRepository;
    private final ProductPricingService pricingService;

    @Override
    public PageableObject<ADProductResponse> search(CustomerProductSearchRequest request) {
        int page = request.getPage() > 0 ? request.getPage() - 1 : 0;

        // Build pageable - sorting is done in query with CASE WHEN
        Pageable pageable = Pageable.ofSize(request.getSize()).withPage(page);

        // Call repository
        List<Object[]> results = productRepository.searchForCustomer(
                request.getName(),
                request.getIdProductCategory(),
                request.getIdBrand(),
                request.getIdTechSpec(),
                request.getStatus(),
                request.getSensorType(),
                request.getLensMount(),
                request.getResolution(),
                request.getProcessor(),
                request.getImageFormat(),
                request.getVideoFormat(),
                request.getIso(),
                request.getSortBy(),
                request.getOrderBy(),
                pageable
        );

        // Extract product IDs for batch queries
        List<String> productIds = results.stream()
                .map(row -> (String) row[0])
                .collect(Collectors.toList());

        if (productIds.isEmpty()) {
            return new PageableObject<>(Collections.emptyList(), 0, 0, request.getSize(), page);
        }

        // Batch fetch: product details + active discounts + images
        List<ProductDetail> allProductDetails = productDetailRepository.findByProductIds(productIds);

        // Batch fetch active discount rows (%, priceAfter, priceBefore per variant)
        long now = System.currentTimeMillis();
        List<String> allDetailIds = allProductDetails.stream()
                .map(ProductDetail::getId)
                .collect(Collectors.toList());
        Map<String, ActiveDiscountInfo> activeDiscounts = parseActiveDiscountRows(
                allDetailIds.isEmpty()
                        ? Collections.emptyList()
                        : discountDetailRepository.findActiveDiscountsByProductDetailIds(allDetailIds, now));

        // Group productDetails by productId
        Map<String, List<ProductDetail>> detailsByProduct = allProductDetails.stream()
                .collect(Collectors.groupingBy(pd -> pd.getProduct().getId()));

        // Compute per-product pricing using the shared service
        Map<String, ProductPricingResult> pricingByProduct = new HashMap<>();
        for (String productId : productIds) {
            List<ProductDetail> details = detailsByProduct.getOrDefault(productId, Collections.emptyList());
            pricingByProduct.put(productId, pricingService.calculateDisplayPrice(details, activeDiscounts));
        }

        // Variant count per product
        Map<String, Integer> variantCountPerProduct = allProductDetails.stream()
                .collect(Collectors.groupingBy(pd -> pd.getProduct().getId()))
                .entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> e.getValue().size()
                ));

        // Batch fetch images per product
        Map<String, List<String>> imagesPerProduct = new HashMap<>();
        for (String pid : productIds) {
            List<ProductImage> imgs = productImageRepository.findImagesByProductId(pid);
            imagesPerProduct.put(pid, imgs.stream().map(ProductImage::getUrl).collect(Collectors.toList()));
        }

        // Convert Object[] to ADProductResponse with computed prices
        List<ADProductResponse> responses = results.stream()
                .map(row -> mapToResponse(row, pricingByProduct, variantCountPerProduct, imagesPerProduct))
                .collect(Collectors.toList());

        // Get total count
        long totalElements = productRepository.count();

        return new PageableObject<>(responses, (int) Math.ceil((double) totalElements / request.getSize()), totalElements, request.getSize(), page);
    }

    private ADProductResponse mapToResponse(
            Object[] row,
            Map<String, ProductPricingResult> pricingByProduct,
            Map<String, Integer> variantCountPerProduct,
            Map<String, List<String>> imagesPerProduct) {

        ADProductResponse response = new ADProductResponse();
        String productId = (String) row[0];
        response.setId(productId);
        response.setName((String) row[1]);
        response.setDescription((String) row[2]);
        response.setIdProductCategory((String) row[3]);
        response.setProductCategoryName((String) row[4]);
        response.setIdBrand((String) row[5]);
        response.setBrandName((String) row[6]);
        response.setIdTechSpec((String) row[7]);
        response.setTechSpecName((String) row[8]);
        response.setStatus((EntityStatus) row[9]);
        response.setCreatedDate((Long) row[10]);
        response.setLastModifiedDate((Long) row[11]);

        // Set pricing from shared service
        ProductPricingResult pricing = pricingByProduct.getOrDefault(productId, ProductPricingResult.noVariant());
        response.setPrice(pricing.getDisplayPrice());
        response.setOriginalPrice(pricing.getOriginalPrice());
        response.setHasActiveSaleCampaign(pricing.isHasActiveSaleCampaign());

        // Set variant count
        response.setVariantCount(variantCountPerProduct.getOrDefault(productId, 0));

        // Set images
        response.setImageUrls(imagesPerProduct.getOrDefault(productId, Collections.emptyList()));

        // Get TechSpec details
        String techSpecId = (String) row[7];
        if (techSpecId != null && !techSpecId.isEmpty()) {
            TechSpec techSpec = techSpecRepository.findById(techSpecId).orElse(null);
            if (techSpec != null) {
                ADTechSpecResponse techSpecResponse = new ADTechSpecResponse();
                techSpecResponse.setId(techSpec.getId());
                techSpecResponse.setSensorType(techSpec.getSensorType());
                techSpecResponse.setLensMount(techSpec.getLensMount());
                techSpecResponse.setResolution(techSpec.getResolution());
                techSpecResponse.setIso(techSpec.getIso());
                techSpecResponse.setProcessor(techSpec.getProcessor());
                techSpecResponse.setImageFormat(techSpec.getImageFormat());
                techSpecResponse.setVideoFormat(techSpec.getVideoFormat());
                techSpecResponse.setStatus(techSpec.getStatus());
                techSpecResponse.setCreatedAt(techSpec.getCreatedDate());
                techSpecResponse.setUpdatedAt(techSpec.getLastModifiedDate());
                response.setTechSpec(techSpecResponse);
            }
        }

        return response;
    }

    @Override
    public ADProductResponse findById(String id) {
        return productRepository.findById(id)
                .map(product -> {
                    ADProductResponse response = new ADProductResponse();
                    response.setId(product.getId());
                    response.setName(product.getName());
                    response.setDescription(product.getDescription());
                    response.setStatus(product.getStatus());
                    response.setCreatedDate(product.getCreatedDate());
                    response.setLastModifiedDate(product.getLastModifiedDate());

                    if (product.getProductCategory() != null) {
                        response.setIdProductCategory(product.getProductCategory().getId());
                        response.setProductCategoryName(product.getProductCategory().getName());
                    }

                    if (product.getBrand() != null) {
                        response.setIdBrand(product.getBrand().getId());
                        response.setBrandName(product.getBrand().getName());
                    }

                    if (product.getTechSpec() != null) {
                        response.setIdTechSpec(product.getTechSpec().getId());
                        response.setTechSpecName(product.getTechSpec().getSensorType());
                        ADTechSpecResponse techSpecResponse = new ADTechSpecResponse();
                        techSpecResponse.setId(product.getTechSpec().getId());
                        techSpecResponse.setSensorType(product.getTechSpec().getSensorType());
                        techSpecResponse.setLensMount(product.getTechSpec().getLensMount());
                        techSpecResponse.setResolution(product.getTechSpec().getResolution());
                        techSpecResponse.setIso(product.getTechSpec().getIso());
                        techSpecResponse.setProcessor(product.getTechSpec().getProcessor());
                        techSpecResponse.setImageFormat(product.getTechSpec().getImageFormat());
                        techSpecResponse.setVideoFormat(product.getTechSpec().getVideoFormat());
                        techSpecResponse.setStatus(product.getTechSpec().getStatus());
                        techSpecResponse.setCreatedAt(product.getTechSpec().getCreatedDate());
                        techSpecResponse.setUpdatedAt(product.getTechSpec().getLastModifiedDate());
                        response.setTechSpec(techSpecResponse);
                    }

                    if (product.getImages() != null && !product.getImages().isEmpty()) {
                        List<String> imageUrls = product.getImages().stream()
                                .sorted(Comparator.comparingInt(
                                        img -> img.getDisplayOrder() != null ? img.getDisplayOrder() : 0))
                                .map(ProductImage::getUrl)
                                .collect(Collectors.toList());
                        response.setImageUrls(imageUrls);
                    }

                    // --- Pricing via shared service ---
                    List<ProductDetail> details = productDetailRepository.findByProductIdWithSerials(id);
                    long now = System.currentTimeMillis();
                    Map<String, ActiveDiscountInfo> activeDiscounts = parseActiveDiscountRows(
                            details.isEmpty()
                                    ? Collections.emptyList()
                                    : discountDetailRepository.findActiveDiscountsByProductDetailIds(
                                            details.stream().map(ProductDetail::getId).collect(Collectors.toList()), now));

                    ProductPricingResult pricing = pricingService.calculateDisplayPrice(details, activeDiscounts);
                    response.setPrice(pricing.getDisplayPrice());
                    response.setOriginalPrice(pricing.getOriginalPrice());
                    response.setHasActiveSaleCampaign(pricing.isHasActiveSaleCampaign());
                    response.setVariantCount(details.size());

                    return response;
                })
                .orElse(null);
    }

    @Override
    public List<ADProductVariantResponse> getVariantsByProductId(String productId) {
        List<ProductDetail> productDetails = productDetailRepository.findByProductIdWithSerials(productId);

        if (productDetails == null || productDetails.isEmpty()) {
            return Collections.emptyList();
        }

        // Batch fetch active discounts for all variants
        long now = System.currentTimeMillis();
        List<String> detailIds = productDetails.stream()
                .map(ProductDetail::getId)
                .collect(Collectors.toList());

        Map<String, ActiveDiscountInfo> activeDiscounts = parseActiveDiscountRows(
                discountDetailRepository.findActiveDiscountsByProductDetailIds(detailIds, now));

        return productDetails.stream()
                .map(pd -> mapToVariantResponse(pd, activeDiscounts))
                .collect(Collectors.toList());
    }

    /**
     * Gộp các dòng JPQL thành map; mỗi biến thể chỉ giữ một bản ghi (bản đầu tiên).
     */
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

    private ADProductVariantResponse mapToVariantResponse(ProductDetail pd, Map<String, ActiveDiscountInfo> activeDiscounts) {
        ADProductVariantResponse variant = new ADProductVariantResponse();
        variant.setId(pd.getId());
        variant.setCode(pd.getCode());
        variant.setVersion(pd.getVersion());
        variant.setSalePrice(pd.getSalePrice());

        BigDecimal salePrice = pd.getSalePrice() != null ? pd.getSalePrice() : BigDecimal.ZERO;
        ActiveDiscountInfo info = activeDiscounts != null ? activeDiscounts.get(pd.getId()) : null;
        BigDecimal displayPrice = ProductPricingRules.resolveFinalPrice(salePrice, info);
        if (displayPrice == null) {
            displayPrice = salePrice;
        }
        boolean hasCampaign = ProductPricingRules.hasActiveDiscount(salePrice, info);

        variant.setDiscountedPrice(hasCampaign ? displayPrice : null);
        variant.setDisplayPrice(displayPrice);
        variant.setHasActiveSaleCampaign(hasCampaign);

        variant.setQuantity(pd.getQuantity());
        variant.setStatus(pd.getStatus());
        variant.setImageUrl(pd.getImageUrl());

        if (pd.getColor() != null) {
            variant.setColorName(pd.getColor().getName());
            variant.setColorCode(pd.getColor().getCode());
        }

        if (pd.getStorageCapacity() != null) {
            variant.setStorageCapacityName(pd.getStorageCapacity().getName());
        }

        // Map danh sách serial của biến thể
        if (pd.getSerials() != null && !pd.getSerials().isEmpty()) {
            List<ADSerialResponse> serialResponses = pd.getSerials().stream()
                    .map(this::mapToSerialResponse)
                    .collect(Collectors.toList());
            variant.setSerials(serialResponses);
        }

        return variant;
    }

    // Map Serial entity to ADSerialResponse
    private ADSerialResponse mapToSerialResponse(Serial serial) {
        return ADSerialResponse.builder()
                .id(serial.getId())
                .serialNumber(serial.getSerialNumber())
                .code(serial.getCode())
                .status(serial.getStatus())
                .serialStatus(serial.getSerialStatus())
                .productDetailId(serial.getProductDetail() != null ? serial.getProductDetail().getId() : null)
                .createdDate(serial.getCreatedDate() != null ? serial.getCreatedDate().toString() : null)
                .build();
    }
}
