package com.example.datn.core.client.product.service;

import com.example.datn.core.client.product.model.response.CnProductResponse;
import com.example.datn.core.client.product.model.response.CnVariantResponse;

import java.util.List;

public interface CnProductService {
    CnProductResponse getProductDetailById(String productId);

    List<CnVariantResponse> getVariantsByProductId(String productId);
}
