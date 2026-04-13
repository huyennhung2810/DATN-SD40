package com.example.datn.core.client.product.service;

import com.example.datn.core.client.product.model.response.RelatedProductResponse;
import com.example.datn.entity.Product;

import java.util.List;

/**
 * Service for computing related/similar products.
 */
public interface RelatedProductService {

    /**
     * Get top-N related products for a given product ID.
     *
     * @param productId the source product
     * @param limit max number of results (default 8)
     * @return ordered list of related products, most similar first
     */
    List<RelatedProductResponse> getRelatedProducts(String productId, int limit);
}
