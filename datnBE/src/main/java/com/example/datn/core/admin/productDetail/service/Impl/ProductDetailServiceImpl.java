package com.example.datn.core.admin.productDetail.service.Impl;

import com.example.datn.core.admin.productDetail.repository.ADProductDetailRepository;
import com.example.datn.core.admin.productDetail.service.ProductDetailService;
import com.example.datn.entity.ProductDetail;
import com.example.datn.repository.ProductDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ProductDetailServiceImpl implements ProductDetailService {

    @Autowired
    private ProductDetailRepository productDetailRepository;
    @Autowired
    private ADProductDetailRepository adProductDetailRepository;
    @Override
    public Page<ProductDetail> getAll(String keyword, Pageable pageable) {
        // Gọi hàm search vừa viết ở Repository
        return adProductDetailRepository.searchByKeyword(keyword, pageable);
    }
}