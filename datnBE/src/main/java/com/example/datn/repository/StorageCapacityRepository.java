package com.example.datn.repository;

import com.example.datn.entity.StorageCapacity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StorageCapacityRepository extends JpaRepository<StorageCapacity, String> {
}
