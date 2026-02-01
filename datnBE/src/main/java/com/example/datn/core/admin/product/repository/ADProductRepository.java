package com.example.datn.core.admin.product.repository;

import com.example.datn.core.admin.product.model.response.ADProductResponse;
import com.example.datn.entity.Product;
import com.example.datn.infrastructure.constant.EntityStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ADProductRepository extends JpaRepository<Product, String> {

    @Query("""
        SELECT
            p.id,
            p.name,
            p.description,
            COALESCE(pc.id, ''),
            COALESCE(pc.name, ''),
            COALESCE(ts.id, ''),
            COALESCE(ts.sensorType, ''),
            p.status,
            p.createdDate,
            p.lastModifiedDate
        FROM Product p
        LEFT JOIN p.productCategory pc
        LEFT JOIN p.techSpec ts
        WHERE (:name IS NULL OR p.name LIKE %:name%)
        AND (:idProductCategory IS NULL OR (p.productCategory IS NOT NULL AND p.productCategory.id = :idProductCategory))
        AND (:idTechSpec IS NULL OR (p.techSpec IS NOT NULL AND p.techSpec.id = :idTechSpec))
        AND (:status IS NULL OR p.status = :status)
        ORDER BY p.lastModifiedDate DESC
    """)
    List<Object[]> searchBasic(
            @Param("name") String name,
            @Param("idProductCategory") String idProductCategory,
            @Param("idTechSpec") String idTechSpec,
            @Param("status") EntityStatus status,
            Pageable pageable
    );
}