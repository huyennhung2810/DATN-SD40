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
            COALESCE(p.price, 0),
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
        AND (:sensorType IS NULL OR (p.techSpec IS NOT NULL AND LOWER(p.techSpec.sensorType) LIKE LOWER(CONCAT('%', :sensorType, '%'))))
        AND (:lensMount IS NULL OR (p.techSpec IS NOT NULL AND LOWER(p.techSpec.lensMount) LIKE LOWER(CONCAT('%', :lensMount, '%'))))
        AND (:resolution IS NULL OR (p.techSpec IS NOT NULL AND LOWER(p.techSpec.resolution) LIKE LOWER(CONCAT('%', :resolution, '%'))))
        AND (:processor IS NULL OR (p.techSpec IS NOT NULL AND LOWER(p.techSpec.processor) LIKE LOWER(CONCAT('%', :processor, '%'))))
        AND (:imageFormat IS NULL OR (p.techSpec IS NOT NULL AND LOWER(p.techSpec.imageFormat) LIKE LOWER(CONCAT('%', :imageFormat, '%'))))
        AND (:videoFormat IS NULL OR (p.techSpec IS NOT NULL AND LOWER(p.techSpec.videoFormat) LIKE LOWER(CONCAT('%', :videoFormat, '%'))))
        AND (:iso IS NULL OR (p.techSpec IS NOT NULL AND LOWER(p.techSpec.iso) LIKE LOWER(CONCAT('%', :iso, '%'))))
        ORDER BY p.lastModifiedDate DESC
    """)
    List<Object[]> searchBasic(
            @Param("name") String name,
            @Param("idProductCategory") String idProductCategory,
            @Param("idTechSpec") String idTechSpec,
            @Param("status") EntityStatus status,
            @Param("sensorType") String sensorType,
            @Param("lensMount") String lensMount,
            @Param("resolution") String resolution,
            @Param("processor") String processor,
            @Param("imageFormat") String imageFormat,
            @Param("videoFormat") String videoFormat,
            @Param("iso") String iso,
            Pageable pageable
    );
}