package com.example.datn.repository;

import com.example.datn.entity.Warranty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WarrantyRepository extends JpaRepository<Warranty, String> {
}
