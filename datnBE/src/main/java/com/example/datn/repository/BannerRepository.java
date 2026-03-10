package com.example.datn.repository;

import com.example.datn.entity.Banner;
import com.example.datn.infrastructure.constant.BannerPosition;
import com.example.datn.infrastructure.constant.BannerType;
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
import java.util.Optional;

@Repository
public interface BannerRepository extends JpaRepository<Banner, String>, JpaSpecificationExecutor<Banner> {

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, String id);

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

    @Query("""
        SELECT b FROM Banner b
        WHERE b.status = :status
        AND b.position = :position
        AND b.type = :type
        AND (b.startAt IS NULL OR b.startAt <= :now)
        AND (b.endAt IS NULL OR b.endAt >= :now)
        ORDER BY b.priority ASC, b.createdDate DESC
    """)
    List<Banner> findActiveBannersByPositionAndType(
            @Param("status") EntityStatus status,
            @Param("position") BannerPosition position,
            @Param("type") BannerType type,
            @Param("now") LocalDateTime now
    );

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

    @Query("""
        SELECT b FROM Banner b
        WHERE b.status = :status
        AND b.position = :position
        AND (b.startAt IS NULL OR b.startAt <= :now)
        AND (b.endAt IS NULL OR b.endAt >= :now)
        ORDER BY b.priority ASC, b.createdDate DESC
    """)
    Optional<Banner> findTopActiveBannerForPopup(
            @Param("status") EntityStatus status,
            @Param("position") BannerPosition position,
            @Param("now") LocalDateTime now
    );

    @Query("SELECT b FROM Banner b WHERE " +
            "(:status IS NULL OR b.status = :status) AND " +
            "(:position IS NULL OR b.position = :position) AND " +
            "(:type IS NULL OR b.type = :type) AND " +
            "(:keyword IS NULL OR b.title LIKE %:keyword% OR b.subtitle LIKE %:keyword% OR b.description LIKE %:keyword%)")
    Page<Banner> searchBanners(
            @Param("status") EntityStatus status,
            @Param("position") BannerPosition position,
            @Param("type") BannerType type,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
