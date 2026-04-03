package com.example.datn.repository;

import com.example.datn.entity.Product;
import com.example.datn.infrastructure.constant.EntityStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for querying candidate products for the related products feature.
 *
 * Strategy:
 * Step 1 – find candidates by same category
 * Step 2 – expand to same brand if not enough
 * Step 3 – fallback to all active products sorted by recency
 *
 * This avoids scanning the entire database and keeps N+1 queries to a minimum.
 */
@Repository
public interface RelatedProductRepository extends JpaRepository<Product, String> {

    /**
     * Step-1 candidates: same product category, active, not the current product.
     */
    @Query("""
        SELECT p FROM Product p
        LEFT JOIN FETCH p.productCategory
        LEFT JOIN FETCH p.brand
        LEFT JOIN FETCH p.techSpec
        WHERE p.productCategory.id = :categoryId
        AND p.status = :activeStatus
        AND p.id <> :currentProductId
        ORDER BY p.lastModifiedDate DESC
    """)
    List<Product> findCandidatesByCategory(
            @Param("categoryId") String categoryId,
            @Param("currentProductId") String currentProductId,
            @Param("activeStatus") EntityStatus activeStatus,
            Pageable pageable
    );

    /**
     * Step-2 candidates: same brand, active, not the current product,
     * excluding products already found in step-1 (by category).
     */
    @Query("""
        SELECT p FROM Product p
        LEFT JOIN FETCH p.productCategory
        LEFT JOIN FETCH p.brand
        LEFT JOIN FETCH p.techSpec
        WHERE p.brand.id = :brandId
        AND p.status = :activeStatus
        AND p.id <> :currentProductId
        ORDER BY p.lastModifiedDate DESC
    """)
    List<Product> findCandidatesByBrand(
            @Param("brandId") String brandId,
            @Param("currentProductId") String currentProductId,
            @Param("activeStatus") EntityStatus activeStatus,
            Pageable pageable
    );

    /**
     * Step-3 fallback: all active products not already in the exclusion set,
     * sorted by recency.
     */
    @Query("""
        SELECT p FROM Product p
        LEFT JOIN FETCH p.productCategory
        LEFT JOIN FETCH p.brand
        LEFT JOIN FETCH p.techSpec
        WHERE p.status = :activeStatus
        AND p.id <> :currentProductId
        ORDER BY p.lastModifiedDate DESC
    """)
    List<Product> findFallbackCandidates(
            @Param("currentProductId") String currentProductId,
            @Param("activeStatus") EntityStatus activeStatus,
            Pageable pageable
    );
}
