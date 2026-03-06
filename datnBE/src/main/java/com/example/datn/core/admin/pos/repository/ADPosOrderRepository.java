package com.example.datn.core.admin.pos.repository;

import com.example.datn.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ADPosOrderRepository extends JpaRepository<Order, String> {
}
