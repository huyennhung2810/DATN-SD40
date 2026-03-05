package com.example.datn.core.admin.discountDetail.service.Impl;

import com.example.datn.core.admin.discountDetail.repository.ADProductDetailForDiscountRepository;
import com.example.datn.core.admin.discountDetail.service.ProductDetailForDiscountService;
import com.example.datn.entity.ProductDetail;
import com.example.datn.repository.ProductDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ProductDetailForDiscountServiceImpl implements ProductDetailForDiscountService {

    @Autowired
    private ProductDetailRepository productDetailRepository;
    @Autowired
    private ADProductDetailForDiscountRepository adProductDetailRepository;
    @Override
    public Page<ProductDetail> getAll(String keyword, Pageable pageable) {
        // Gọi hàm search vừa viết ở Repository
        return adProductDetailRepository.searchByKeyword(keyword, pageable);
    }
}