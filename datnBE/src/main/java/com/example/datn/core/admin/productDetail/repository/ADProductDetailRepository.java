package com.example.datn.core.admin.productDetail.repository;

import com.example.datn.repository.ProductDetailRepository;
import com.example.datn.entity.ProductDetail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ADProductDetailRepository extends ProductDetailRepository {
    // Tìm kiếm theo tên sản phẩm hoặc mã sản phẩm
    @Query("SELECT pd FROM ProductDetail pd WHERE " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "lower(pd.product.name) LIKE lower(concat('%', :keyword, '%')) OR " +
            "lower(pd.code) LIKE lower(concat('%', :keyword, '%')))")
    Page<ProductDetail> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}