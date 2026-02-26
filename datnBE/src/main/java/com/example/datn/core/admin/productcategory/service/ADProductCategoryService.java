package com.example.datn.core.admin.productcategory.service;

import com.example.datn.core.admin.productcategory.model.request.ADProductCategoryRequest;
import com.example.datn.core.admin.productcategory.model.request.ADProductCategorySearchRequest;
import com.example.datn.core.admin.productcategory.model.response.ADProductCategoryResponse;
import com.example.datn.core.common.base.PageableObject;

public interface ADProductCategoryService {
    PageableObject<ADProductCategoryResponse> search(ADProductCategorySearchRequest request);
    ADProductCategoryResponse create(ADProductCategoryRequest request);
    ADProductCategoryResponse update(String id, ADProductCategoryRequest request);
    void delete(String id);
    ADProductCategoryResponse findById(String id);
}