package com.example.datn.repository;

import com.example.datn.entity.Processor;
import com.example.datn.infrastructure.constant.EntityStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProcessorRepository extends JpaRepository<Processor, String> {

    @Query("SELECT p FROM Processor p WHERE " +
            "(:status IS NULL OR p.status = :status) AND " +
            "(p.name LIKE %:keyword% OR p.code LIKE %:keyword%)")
    Page<Processor> search(@Param("keyword") String keyword,
                          @Param("status") EntityStatus status,
                          Pageable pageable);

    List<Processor> findByStatus(EntityStatus status);

    boolean existsByName(String name);
}

