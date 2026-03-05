package com.example.datn.repository;

import com.example.datn.entity.Banner;
import com.example.datn.infrastructure.constant.EntityStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, String> {

    @Query("""
        SELECT b FROM Banner b
        WHERE b.status = :status
        AND b.position = :position
        AND (b.startAt IS NULL OR b.startAt <= :now)
        AND (b.endAt IS NULL OR b.endAt >= :now)
        ORDER BY b.priority DESC, b.createdDate DESC
    """)
    List<Banner> findActiveBanners(
            @Param("status") EntityStatus status,
            @Param("position") String position,
            @Param("now") LocalDateTime now
    );

    @Query("""
        SELECT b FROM Banner b
        WHERE b.status = :status
        AND (b.startAt IS NULL OR b.startAt <= :now)
        AND (b.endAt IS NULL OR b.endAt >= :now)
        ORDER BY b.priority DESC, b.createdDate DESC
    """)
    List<Banner> findAllActiveBanners(
            @Param("status") EntityStatus status,
            @Param("now") LocalDateTime now
    );
}

