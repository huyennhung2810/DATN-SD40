package com.example.datn.repository;

import com.example.datn.entity.HandoverProductAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HandoverProductAuditRepository extends JpaRepository<HandoverProductAudit, String> {
}
