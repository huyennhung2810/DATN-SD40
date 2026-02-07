package com.example.datn.repository;

import com.example.datn.entity.ImageFormat;
import com.example.datn.infrastructure.constant.EntityStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageFormatRepository extends JpaRepository<ImageFormat, String> {

    @Query("SELECT i FROM ImageFormat i WHERE " +
            "(:status IS NULL OR i.status = :status) AND " +
            "(i.name LIKE %:keyword% OR i.code LIKE %:keyword%)")
    Page<ImageFormat> search(@Param("keyword") String keyword,
                            @Param("status") EntityStatus status,
                            Pageable pageable);

    List<ImageFormat> findByStatus(EntityStatus status);

    boolean existsByName(String name);
}

