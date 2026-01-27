package com.example.datn.core.admin.customer.service;

import com.example.datn.core.admin.customer.model.request.ADProductDetailRequest;
import com.example.datn.core.common.base.ResponseObject;
import org.springframework.data.domain.Pageable;

public interface ADProductDetailService {

    ResponseObject<?> getAllProductDetails();

    ResponseObject<?> getAllProductDetailsByProductId(String productId);

    ResponseObject<?> getAllProductDetailsByProductIdAndStatus(String productId);

    ResponseObject<?> createProductDetail(ADProductDetailRequest request);

    ResponseObject<?> updateProductDetail(String productDetailId, ADProductDetailRequest request);
}
