package com.example.datn.core.admin.productcategory.repository;

import com.example.datn.entity.ProductCategory;
import com.example.datn.infrastructure.constant.EntityStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ADProductCategoryRepository extends JpaRepository<ProductCategory, String> {
    
    @Query("""
        SELECT pc FROM ProductCategory pc
        WHERE (:keyword IS NULL OR pc.name LIKE %:keyword% OR pc.code LIKE %:keyword%)
        AND (:status IS NULL OR pc.status = :status)
        ORDER BY pc.createdDate DESC
    """)
    Page<ProductCategory> search(
        @Param("keyword") String keyword,
        @Param("status") EntityStatus status,
        Pageable pageable
    );
    
    boolean existsByCode(String code);
}