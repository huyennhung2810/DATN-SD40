package com.example.datn.core.admin.techspec.repository;

import com.example.datn.entity.TechSpec;
import com.example.datn.infrastructure.constant.EntityStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ADTechSpecRepository extends JpaRepository<TechSpec, String> {

    @Query("""
        SELECT ts FROM TechSpec ts
        WHERE (:keyword IS NULL OR 
               ts.sensorType LIKE %:keyword% OR 
               ts.lensMount LIKE %:keyword% OR
               ts.resolution LIKE %:keyword%)
        AND (:status IS NULL OR ts.status = :status)
        ORDER BY ts.createdDate DESC
    """)
    Page<TechSpec> search(
            @Param("keyword") String keyword,
            @Param("status") EntityStatus status,
            Pageable pageable
    );
}