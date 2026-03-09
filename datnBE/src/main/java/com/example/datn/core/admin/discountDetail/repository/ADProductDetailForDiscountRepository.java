package com.example.datn.core.admin.discountDetail.repository;

import com.example.datn.repository.ProductDetailRepository;
import com.example.datn.entity.ProductDetail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ADProductDetailForDiscountRepository extends ProductDetailRepository {
    // Tìm kiếm theo tên sản phẩm hoặc mã sản phẩm
    @Query("SELECT pd FROM ProductDetail pd " +
            "LEFT JOIN pd.product p " +
            // Thêm điều kiện status = 1 (hoặc status = ACTIVE tùy kiểu dữ liệu của bạn)
            "WHERE pd.status = 1 AND " +
            // Bọc toàn bộ logic check keyword vào 1 ngoặc tròn
            "(:keyword IS NULL OR :keyword = '' OR " +
            "lower(p.name) LIKE lower(concat('%', :keyword, '%')) OR " +
            "lower(pd.code) LIKE lower(concat('%', :keyword, '%')))")
    Page<ProductDetail> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}