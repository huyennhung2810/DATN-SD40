package com.example.datn.core.admin.discountDetail.service.Impl;

import com.example.datn.core.admin.discountDetail.service.ProductDetailService;
import com.example.datn.core.admin.productdetail.repository.ADProductDetailRepository;
import com.example.datn.entity.ProductDetail;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ProductDetailServiceImpl implements ProductDetailService {

    @Autowired
    private ADProductDetailRepository adProductDetailRepository;
    @Override
    public Page<ProductDetail> getAll(String keyword, Pageable pageable) {
        // Gọi hàm search vừa viết ở Repository
        return adProductDetailRepository.searchByKeyword(keyword, pageable);
    }
}
