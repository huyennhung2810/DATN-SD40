package com.example.datn.core.client.product.service;

import com.example.datn.core.client.product.model.response.CnProductResponse;

public interface CnProductService {
    CnProductResponse getProductDetailById(String productId);
}
