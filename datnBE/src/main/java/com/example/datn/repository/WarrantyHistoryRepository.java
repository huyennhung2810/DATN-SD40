package com.example.datn.repository;

import com.example.datn.entity.WarrantyHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WarrantyHistoryRepository extends JpaRepository<WarrantyHistory, String> {
}
