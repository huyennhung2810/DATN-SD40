package com.example.datn.repository;

import com.example.datn.entity.ProductDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductDetailRepository extends JpaRepository<ProductDetail, String> {

    boolean existsByCode(String code);
    List<ProductDetail> findByProduct_Id(String productId);
}
