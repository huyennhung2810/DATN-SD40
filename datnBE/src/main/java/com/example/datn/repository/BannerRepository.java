package com.example.datn.repository;

import com.example.datn.entity.Banner;
import com.example.datn.infrastructure.constant.BannerPosition;
import com.example.datn.infrastructure.constant.EntityStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, String>, JpaSpecificationExecutor<Banner> {

    /**
     * Find all active banners for client by position
     * Conditions:
     * - status = ACTIVE
     * - startAt is null OR startAt <= now
     * - endAt is null OR endAt >= now
     * - position = given position
     * Order by priority ASC, createdDate DESC
     */
    @Query("""
        SELECT b FROM Banner b
        WHERE b.status = :status
        AND b.position = :position
        AND (b.startAt IS NULL OR b.startAt <= :now)
        AND (b.endAt IS NULL OR b.endAt >= :now)
        ORDER BY b.priority ASC, b.createdDate DESC
    """)
    List<Banner> findActiveBannersByPosition(
            @Param("status") EntityStatus status,
            @Param("position") BannerPosition position,
            @Param("now") LocalDateTime now
    );

    /**
     * Find all active banners for client (all positions)
     */
    @Query("""
        SELECT b FROM Banner b
        WHERE b.status = :status
        AND (b.startAt IS NULL OR b.startAt <= :now)
        AND (b.endAt IS NULL OR b.endAt >= :now)
        ORDER BY b.position, b.priority ASC, b.createdDate DESC
    """)
    List<Banner> findAllActiveBanners(
            @Param("status") EntityStatus status,
            @Param("now") LocalDateTime now
    );

    /**
     * Find active banners grouped by position for client
     */
    @Query("""
        SELECT b FROM Banner b
        WHERE b.status = :status
        AND b.position = :position
        AND (b.startAt IS NULL OR b.startAt <= :now)
        AND (b.endAt IS NULL OR b.endAt >= :now)
        ORDER BY b.priority ASC, b.createdDate DESC
    """)
    List<Banner> findActiveBannersByPositionNoParam(
            @Param("status") EntityStatus status,
            @Param("position") BannerPosition position,
            @Param("now") LocalDateTime now
    );

    /**
     * Check if code exists (for unique validation)
     */
    boolean existsByCode(String code);

    /**
     * Check if code exists excluding current id (for update)
     */
    boolean existsByCodeAndIdNot(String code, String id);
}
