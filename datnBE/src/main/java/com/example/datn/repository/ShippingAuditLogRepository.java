package com.example.datn.repository;

import com.example.datn.entity.ShippingAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShippingAuditLogRepository extends JpaRepository<ShippingAuditLog, String> {

    List<ShippingAuditLog> findByOrderIdOrderByCreatedDateDesc(String orderId);
}
