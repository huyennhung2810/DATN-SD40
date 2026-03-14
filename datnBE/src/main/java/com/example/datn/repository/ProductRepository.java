package com.example.datn.repository;

import com.example.datn.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    @Query("SELECT p FROM Product p " +
            "LEFT JOIN FETCH p.techSpec " +
            "WHERE p.name LIKE %:keyword% " +
            "OR p.description LIKE %:keyword% " +
            "OR p.productCategory.name LIKE %:keyword%")
    List<Product> findProductsForAi(String keyword);
}
