package com.example.datn.core.admin.product.service.Impl;

import com.example.datn.core.admin.product.model.request.CustomerProductSearchRequest;
import com.example.datn.core.admin.product.model.response.ADProductResponse;
import com.example.datn.core.admin.product.model.response.ADProductVariantResponse;
import com.example.datn.core.admin.product.repository.ADProductRepository;
import com.example.datn.core.admin.product.service.CustomerProductService;
import com.example.datn.core.admin.productDetail.repository.ADProductDetailRepository;
import com.example.datn.core.admin.productimage.repository.ADProductImageRepository;
import com.example.datn.core.admin.techspec.model.response.ADTechSpecResponse;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.entity.ProductDetail;
import com.example.datn.entity.ProductImage;
import com.example.datn.entity.TechSpec;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.repository.TechSpecRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerProductServiceImpl implements CustomerProductService {

    private final ADProductRepository productRepository;
    private final TechSpecRepository techSpecRepository;
    private final ADProductImageRepository productImageRepository;
    private final ADProductDetailRepository productDetailRepository;

    @Override
    public PageableObject<ADProductResponse> search(CustomerProductSearchRequest request) {
        int page = request.getPage() > 0 ? request.getPage() - 1 : 0;
        
        // Build pageable - sorting is done in query with CASE WHEN
        Pageable pageable = Pageable.ofSize(request.getSize()).withPage(page);

        // Call repository
        List<Object[]> results = productRepository.searchForCustomer(
                request.getName(),
                request.getIdProductCategory(),
                request.getIdTechSpec(),
                request.getStatus(),
                request.getSensorType(),
                request.getLensMount(),
                request.getResolution(),
                request.getProcessor(),
                request.getImageFormat(),
                request.getVideoFormat(),
                request.getIso(),
                request.getMinPrice(),
                request.getMaxPrice(),
                request.getSortBy(),
                request.getOrderBy(),
                pageable
        );

        // Convert Object[] to ADProductResponse
        List<ADProductResponse> responses = results.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        // Get total count
        long totalElements = productRepository.count();

        return new PageableObject<>(responses, (totalElements + request.getSize() - 1) / request.getSize(), totalElements, request.getSize(), page);
    }

    @Override
    public ADProductResponse findById(String id) {
        return productRepository.findById(id)
                .map(product -> {
                    ADProductResponse response = new ADProductResponse();
                    response.setId(product.getId());
                    response.setName(product.getName());
                    response.setDescription(product.getDescription());
                    response.setPrice(product.getPrice());
                    response.setStatus(product.getStatus());
                    response.setCreatedDate(product.getCreatedDate());
                    response.setLastModifiedDate(product.getLastModifiedDate());

                    if (product.getProductCategory() != null) {
                        response.setIdProductCategory(product.getProductCategory().getId());
                        response.setProductCategoryName(product.getProductCategory().getName());
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
                                .sorted((a, b) -> Integer.compare(
                                        a.getDisplayOrder() != null ? a.getDisplayOrder() : 0,
                                        b.getDisplayOrder() != null ? b.getDisplayOrder() : 0))
                                .map(ProductImage::getUrl)
                                .collect(Collectors.toList());
                        response.setImageUrls(imageUrls);
                    }

                    return response;
                })
                .orElse(null);
    }

    private ADProductResponse mapToResponse(Object[] row) {
        ADProductResponse response = new ADProductResponse();
        response.setId((String) row[0]);
        response.setName((String) row[1]);
        response.setDescription((String) row[2]);
        response.setIdProductCategory((String) row[3]);
        response.setProductCategoryName((String) row[4]);
        response.setIdTechSpec((String) row[5]);
        response.setTechSpecName((String) row[6]);
        response.setPrice(row[7] != null ? (java.math.BigDecimal) row[7] : null);
        response.setStatus((EntityStatus) row[8]);
        response.setCreatedDate((Long) row[9]);
        response.setLastModifiedDate((Long) row[10]);

        // Get TechSpec details
        String techSpecId = (String) row[5];
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

        // Get images
        String productId = (String) row[0];
        List<ProductImage> images = productImageRepository.findImagesByProductId(productId);
        List<String> imageUrls = images.stream()
                .map(ProductImage::getUrl)
                .collect(Collectors.toList());
        response.setImageUrls(imageUrls);

        return response;
    }

    @Override
    public List<ADProductVariantResponse> getVariantsByProductId(String productId) {
        List<ProductDetail> productDetails = productDetailRepository.findByProductId(productId);
        
        if (productDetails == null || productDetails.isEmpty()) {
            return Collections.emptyList();
        }

        return productDetails.stream()
                .map(this::mapToVariantResponse)
                .collect(Collectors.toList());
    }

    private ADProductVariantResponse mapToVariantResponse(ProductDetail pd) {
        ADProductVariantResponse variant = new ADProductVariantResponse();
        variant.setId(pd.getId());
        variant.setCode(pd.getCode());
        variant.setVersion(pd.getVersion());
        variant.setSalePrice(pd.getSalePrice());
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

        return variant;
    }
}
