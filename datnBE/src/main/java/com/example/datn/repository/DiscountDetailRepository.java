package com.example.datn.repository;

import com.example.datn.entity.DiscountDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DiscountDetailRepository  extends JpaRepository<DiscountDetail, String> {

    // Dùng JPQL để JOIN thẳng sang bảng discount cha và check status = 2
    @Query("SELECT dd FROM DiscountDetail dd " +
            "JOIN dd.discount d " +
            "WHERE dd.productDetail.id = :productDetailId " +
            "AND d.status = 2")
    DiscountDetail getActiveDiscountByProductDetailId(@Param("productDetailId") String productDetailId);
}
