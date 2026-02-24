package com.example.datn.repository;

import com.example.datn.entity.SensorType;
import com.example.datn.infrastructure.constant.EntityStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SensorTypeRepository extends JpaRepository<SensorType, String> {

    @Query("SELECT s FROM SensorType s WHERE " +
            "(:status IS NULL OR s.status = :status) AND " +
            "(s.name LIKE %:keyword% OR s.code LIKE %:keyword%)")
    Page<SensorType> search(@Param("keyword") String keyword,
                            @Param("status") EntityStatus status,
                            Pageable pageable);

    List<SensorType> findByStatus(EntityStatus status);

    boolean existsByName(String name);
}

