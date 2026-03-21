package com.example.datn.core.client.product.service;

import com.example.datn.core.client.product.model.response.CnProductResponse;
import com.example.datn.core.client.product.model.response.CnVariantResponse;

import java.util.List;

public interface CnProductService {
    CnProductResponse getProductDetailById(String productId);

    /**
     * Get all variants (product details) for a product with pricing info.
     * Used by the client-side product detail page and variant modal.
     *
     * @param productId the parent product ID
     * @return list of CnVariantResponse with originalPrice, discountedPrice, displayPrice
     */
    List<CnVariantResponse> getVariantsByProductId(String productId);
}
