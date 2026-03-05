package com.example.datn.core.admin.shiftTemplate.repository;

import com.example.datn.entity.ShiftTemplate;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.repository.ShiftTemplateRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;

@Repository
public interface ADShiftTemplateRepository extends ShiftTemplateRepository {
    List<ShiftTemplate> findAllByStatus(EntityStatus status);

    @Query("SELECT s FROM ShiftTemplate s WHERE " +
            "(:keyword IS NULL OR s.name LIKE %:keyword% OR s.code LIKE %:keyword%) AND " +
            "(:status IS NULL OR s.status = :status) AND " +
            "(:startTime IS NULL OR s.startTime >= :startTime) AND " +
            "(:endTime IS NULL OR s.endTime <= :endTime)")
    List<ShiftTemplate> searchShifts(
            @Param("keyword") String keyword,
            @Param("status") EntityStatus status,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);
}
