package com.example.datn.core.admin.workSchedule.repository;

import com.example.datn.entity.WorkSchedule;
import com.example.datn.infrastructure.constant.ShiftStatus;
import com.example.datn.repository.WorkScheduleRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ADWorkScheduleRepository extends WorkScheduleRepository {

    // Kiểm tra nv đã có ca này trong ngày chưa để tránh trùng
    boolean existsByEmployee_IdAndShiftTemplate_IdAndWorkDate(
            String employeeId, String shiftTemplateId, LocalDate workDate);


    // Lấy danh sách lịch theo khoảng thời gian (cho màn hình lịch)
    @Query("SELECT w FROM WorkSchedule w " +
            "WHERE w.workDate BETWEEN :fromDate AND :toDate " +
            "ORDER BY w.workDate ASC, w.shiftTemplate.startTime ASC")
    List<WorkSchedule> findSchedulesInRange(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate);

    Optional<WorkSchedule> findByEmployee_IdAndWorkDateAndShiftStatusIn(
            String employeeId,
            LocalDate workDate,
            List<ShiftStatus> shiftStatusList);


    boolean existsByEmployee_IdAndShiftTemplate_IdAndWorkDateAndIdNot(
            String employeeId, String shiftTemplateId, LocalDate workDate, String id);

}
