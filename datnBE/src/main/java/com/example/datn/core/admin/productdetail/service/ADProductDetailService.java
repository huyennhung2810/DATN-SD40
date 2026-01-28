package com.example.datn.core.admin.productdetail.service;

import com.example.datn.core.admin.productdetail.model.request.ADProductDetailRequest;
import com.example.datn.core.common.base.ResponseObject;

public interface ADProductDetailService {

    ResponseObject<?> getAllProductDetails();

    ResponseObject<?> getAllProductDetailsByProductId(String productId);

    ResponseObject<?> getAllProductDetailsByProductIdAndStatus(String productId);

    ResponseObject<?> createProductDetail(ADProductDetailRequest request);

    ResponseObject<?> updateProductDetail(String productDetailId, ADProductDetailRequest request);
}
