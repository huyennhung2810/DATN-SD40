package com.example.datn.repository;

import com.example.datn.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BillDetailRepository extends JpaRepository<OrderDetail, String> {
}
