package com.example.datn.repository;

import com.example.datn.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, String> {
    List<ProductImage> findByProduct_Id(String productId);
    @Query(value = "SELECT url FROM datn.product_image WHERE id = :id", nativeQuery = true)
    String findUrlById(@Param("id") String id);
}
