package com.example.datn.repository;

import com.example.datn.entity.ProductDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductDetailRepository extends JpaRepository<ProductDetail, String> {

    boolean existsByCode(String code);
    List<ProductDetail> findByProduct_Id(String productId);

    /**
     * Batch fetch all ProductDetail rows for a given list of product IDs.
     * Uses status = 0 (ordinal of EntityStatus.ACTIVE) to match the DB column,
     * consistent with how ADProductDetailRepository queries active variants.
     */
    @Query("SELECT pd FROM ProductDetail pd WHERE pd.product.id IN :productIds AND pd.status = 0 AND pd.quantity > 0")
    List<ProductDetail> findValidByProductIds(@Param("productIds") List<String> productIds);
}
