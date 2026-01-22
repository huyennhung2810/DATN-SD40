package com.example.datn.repository;

import com.example.datn.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BillRepository extends JpaRepository<Order, String> {
}
