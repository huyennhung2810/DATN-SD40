package com.example.datn.repository;

import com.example.datn.entity.LensMount;
import com.example.datn.infrastructure.constant.EntityStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LensMountRepository extends JpaRepository<LensMount, String> {

    @Query("SELECT l FROM LensMount l WHERE " +
            "(:status IS NULL OR l.status = :status) AND " +
            "(l.name LIKE %:keyword% OR l.code LIKE %:keyword%)")
    Page<LensMount> search(@Param("keyword") String keyword,
                          @Param("status") EntityStatus status,
                          Pageable pageable);

    List<LensMount> findByStatus(EntityStatus status);

    boolean existsByName(String name);
}

