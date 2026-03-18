package com.example.datn.core.admin.brand.repository;

import com.example.datn.entity.Brand;
import com.example.datn.infrastructure.constant.EntityStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ADBrandRepository extends JpaRepository<Brand, String> {
    
    @Query("""
        SELECT b FROM Brand b
        WHERE (:keyword IS NULL OR b.name LIKE %:keyword% OR b.code LIKE %:keyword%)
        AND (:status IS NULL OR b.status = :status)
        ORDER BY b.createdDate DESC
    """)
    Page<Brand> search(
        @Param("keyword") String keyword,
        @Param("status") EntityStatus status,
        Pageable pageable
    );
    
    boolean existsByCode(String code);
}
