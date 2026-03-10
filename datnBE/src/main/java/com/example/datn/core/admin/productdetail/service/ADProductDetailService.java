package com.example.datn.core.admin.productDetail.service;

import com.example.datn.core.admin.productDetail.model.request.ADProductDetailRequest;
import com.example.datn.core.admin.productDetail.model.response.ADProductDetailResponse;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.EntityStatus;

public interface ADProductDetailService {

    ResponseObject<?> getAllProductDetails(String keyword, EntityStatus status);

    ResponseObject<?> getById(String id);

    ADProductDetailResponse addProductDetail(ADProductDetailRequest request);

    ResponseObject<?> updateProductDetail(String productDetailId, ADProductDetailRequest request);
}
