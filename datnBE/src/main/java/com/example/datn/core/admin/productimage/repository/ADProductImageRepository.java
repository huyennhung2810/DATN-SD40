package com.example.datn.core.admin.productimage.repository;

import com.example.datn.core.admin.productimage.model.response.ADProductImageResponse;
import com.example.datn.entity.ProductImage;
import com.example.datn.repository.ProductImageRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ADProductImageRepository extends ProductImageRepository {

    @Query("""
        SELECT new com.example.datn.core.admin.productimage.model.response.ADProductImageResponse(
            pi.id,
            pi.product.id,
            pi.product.name,
            pi.displayOrder,
            pi.url,
            pi.createdDate
        )
        FROM ProductImage pi
        LEFT JOIN pi.product p
        WHERE pi.product.id = :productId
        ORDER BY pi.displayOrder ASC, pi.createdDate DESC
        """)
    List<ADProductImageResponse> findByProductId(@Param("productId") String productId);

    // Lấy danh sách ProductImage entity theo productId (để lấy URL)
    @Query("SELECT pi FROM ProductImage pi WHERE pi.product.id = :productId ORDER BY pi.displayOrder ASC")
    List<ProductImage> findImagesByProductId(@Param("productId") String productId);
}