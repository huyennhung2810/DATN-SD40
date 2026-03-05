package com.example.datn.core.admin.product.service;

import com.example.datn.core.admin.product.model.request.ADProductRequest;
import com.example.datn.core.admin.product.model.request.ADProductSearchRequest;
import com.example.datn.core.admin.product.model.response.ADProductResponse;
import com.example.datn.core.common.base.PageableObject;

public interface ADProductService {
    
    PageableObject<ADProductResponse> search(ADProductSearchRequest request);
    
    ADProductResponse create(ADProductRequest request);
    
    ADProductResponse update(String id, ADProductRequest request);
    
    void delete(String id);
    
    ADProductResponse findById(String id);
}