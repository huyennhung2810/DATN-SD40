package com.example.datn.core.admin.discountDetail.service;

import com.example.datn.entity.ProductDetail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductDetailForDiscountService {
    Page<ProductDetail> getAll(String keyword, Pageable pageable);
}
