package com.example.datn.repository;

import com.example.datn.entity.DiscountDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PromotionDetailRepository extends JpaRepository<DiscountDetail, String> {
}
