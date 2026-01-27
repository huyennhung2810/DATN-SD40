package com.example.datn.core.admin.customer.repository;

import com.example.datn.core.admin.customer.model.response.ADProductDetailResponse;
import com.example.datn.entity.ProductDetail;
import com.example.datn.repository.ProductDetailRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public interface ADProductDetailRepository extends ProductDetailRepository {
    Page<ProductDetail> findAll(Pageable pageable);

    Page<ProductDetail> findByProductId(String productId, Pageable pageable);

}
