package com.example.datn.core.admin.customer.repository;

import com.example.datn.entity.Color;
import com.example.datn.repository.StorageCapacityRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ADStorageCapacityRepository extends StorageCapacityRepository {

    Optional<Color> findByCode(String code);
}
