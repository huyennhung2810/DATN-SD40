package com.example.datn.core.admin.discountDetail.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductDetailForDiscountService {

    Page<?> getAll(String keyword, String currentDiscountId, Pageable pageable);
}
