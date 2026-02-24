package com.example.datn.repository;

import com.example.datn.entity.Resolution;
import com.example.datn.infrastructure.constant.EntityStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResolutionRepository extends JpaRepository<Resolution, String> {

    @Query("SELECT r FROM Resolution r WHERE " +
            "(:status IS NULL OR r.status = :status) AND " +
            "(r.name LIKE %:keyword% OR r.code LIKE %:keyword%)")
    Page<Resolution> search(@Param("keyword") String keyword,
                           @Param("status") EntityStatus status,
                           Pageable pageable);

    List<Resolution> findByStatus(EntityStatus status);

    boolean existsByName(String name);
}

