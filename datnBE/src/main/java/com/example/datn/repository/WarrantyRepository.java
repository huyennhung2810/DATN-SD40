package com.example.datn.repository;

import com.example.datn.entity.Warranty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WarrantyRepository extends JpaRepository<Warranty, String> {
    Optional<Warranty> findBySerial_Id(String serialId);
}
