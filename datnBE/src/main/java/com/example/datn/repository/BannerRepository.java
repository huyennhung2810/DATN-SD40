package com.example.datn.repository;

import com.example.datn.entity.Banner;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, String> {

    @Query("SELECT b FROM Banner b WHERE " +
           "(:keyword IS NULL OR b.title LIKE %:keyword% OR b.description LIKE %:keyword%) " +
           "AND (:status IS NULL OR b.status = :status) " +
           "AND (:slot IS NULL OR b.slot = :slot)")
    Page<Banner> search(
            @Param("keyword") String keyword,
            @Param("status") Integer status,
            @Param("slot") String slot,
            Pageable pageable
    );

    @Query("SELECT b FROM Banner b WHERE " +
           "b.status = 1 " +
           "AND (b.startAt IS NULL OR b.startAt <= :currentTime) " +
           "AND (b.endAt IS NULL OR b.endAt >= :currentTime) " +
           "AND (:slot IS NULL OR b.slot = :slot) " +
           "ORDER BY b.priority DESC, b.createdDate DESC")
    List<Banner> findActiveBanners(
            @Param("currentTime") Long currentTime,
            @Param("slot") String slot
    );
}

