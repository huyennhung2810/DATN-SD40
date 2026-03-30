package com.example.datn.repository;

import com.example.datn.entity.DiscountDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DiscountDetailRepository  extends JpaRepository<DiscountDetail, String> {

    // Thêm duy nhất dòng này:
    DiscountDetail findFirstByProductDetail_IdAndStatus(String productDetailId, Integer status);

    @Query(value = "SELECT * FROM discount_detail WHERE id_product_detail = :productDetailId AND status = 1 LIMIT 1", nativeQuery = true)
    DiscountDetail getActiveDiscountByProductDetailId(@Param("productDetailId") String productDetailId);
}
