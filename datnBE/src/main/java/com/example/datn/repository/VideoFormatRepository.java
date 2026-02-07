package com.example.datn.repository;

import com.example.datn.entity.VideoFormat;
import com.example.datn.infrastructure.constant.EntityStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoFormatRepository extends JpaRepository<VideoFormat, String> {

    @Query("SELECT v FROM VideoFormat v WHERE " +
            "(:status IS NULL OR v.status = :status) AND " +
            "(v.name LIKE %:keyword% OR v.code LIKE %:keyword%)")
    Page<VideoFormat> search(@Param("keyword") String keyword,
                            @Param("status") EntityStatus status,
                            Pageable pageable);

    List<VideoFormat> findByStatus(EntityStatus status);

    boolean existsByName(String name);
}

