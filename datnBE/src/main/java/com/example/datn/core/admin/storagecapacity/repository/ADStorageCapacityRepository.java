package com.example.datn.core.admin.storagecapacity.repository;

import com.example.datn.entity.StorageCapacity;
import com.example.datn.repository.StorageCapacityRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ADStorageCapacityRepository extends StorageCapacityRepository {

    Optional<StorageCapacity> findByCode(String code);

    @Query("SELECT s FROM StorageCapacity s ORDER BY s.createdDate DESC")
    List<StorageCapacity> getAllSorted();
}
