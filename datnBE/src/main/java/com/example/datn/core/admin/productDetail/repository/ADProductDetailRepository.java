package com.example.datn.core.admin.productDetail.repository;

import com.example.datn.entity.ProductDetail;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.repository.ProductDetailRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ADProductDetailRepository extends ProductDetailRepository {

    Page<ProductDetail> findAll(Pageable pageable);

    Page<ProductDetail> findByProductId(String productId, Pageable pageable);

    @Query("SELECT pd FROM ProductDetail pd WHERE " +
            "(:kw IS NULL OR :kw = '' OR pd.code LIKE %:kw% OR pd.product.name LIKE %:kw%) " +
            "AND (:sts IS NULL OR pd.status = :sts) " +
            "ORDER BY pd.createdDate DESC")
    List<ProductDetail> searchProductDetail(
            @Param("kw") String keyword,
            @Param("sts") EntityStatus status
    );


    @Query("SELECT pd FROM ProductDetail pd WHERE " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "lower(pd.product.name) LIKE lower(concat('%', :keyword, '%')) OR " +
            "lower(pd.code) LIKE lower(concat('%', :keyword, '%')))")
    Page<ProductDetail> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}
