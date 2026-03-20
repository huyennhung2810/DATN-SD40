package com.example.datn.core.admin.discountDetail.service;

import com.example.datn.core.admin.discountDetail.model.ADDiscountProductDetailResponse;
import com.example.datn.entity.ProductDetail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductDetailForDiscountService {
    Page<ADDiscountProductDetailResponse> getAll(String keyword, Pageable pageable);
}
