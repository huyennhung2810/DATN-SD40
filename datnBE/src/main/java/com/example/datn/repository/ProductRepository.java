package com.example.datn.repository;

import com.example.datn.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {

    /**
     * Chi tiết sản phẩm client: load luôn {@link com.example.datn.entity.TechSpec} (JOIN FETCH)
     * để tránh LazyInitializationException khi service không mở transaction đủ dài.
     */
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.techSpec WHERE p.id = :id")
    Optional<Product> findByIdWithTechSpec(@Param("id") String id);

    @Query("SELECT p FROM Product p " +
            "LEFT JOIN FETCH p.techSpec " +
            "WHERE p.name LIKE %:keyword% " +
            "OR p.description LIKE %:keyword% " +
            "OR p.productCategory.name LIKE %:keyword%")
    List<Product> findProductsForAi(String keyword);
}
