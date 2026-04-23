package com.example.datn.core.admin.handovers.repository;

import com.example.datn.entity.ShiftHandover;
import com.example.datn.infrastructure.constant.HandoverStatus;
import com.example.datn.infrastructure.constant.OrderStatus;
import com.example.datn.repository.ShiftHandoverRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface ADShiftHandoverRepository extends ShiftHandoverRepository {

        // Tìm phiếu giao ca theo lịch làm việc
        Optional<ShiftHandover> findByWorkSchedule_Id(String scheduleId);

        // Lấy ca gần nhất đã đóng để làm tiền đầu ca cho ca mới
        Optional<ShiftHandover> findTopByHandoverStatusOrderByCheckOutTimeDesc(HandoverStatus status);

        @Query("""
    SELECT COALESCE(SUM(o.totalAfterDiscount), 0)
    FROM Order o
    WHERE o.shiftHandover.id = :shiftId
    AND o.orderStatus = :status
    AND o.paymentMethod = :paymentMethod
""")
        BigDecimal sumRevenueByShift(
                @Param("shiftId") String shiftId,
                @Param("status") OrderStatus status,
                @Param("paymentMethod") String paymentMethod);

        @Query("""
                            SELECT s FROM ShiftHandover s
                            WHERE (:staffId IS NULL OR s.workSchedule.employee.id = :staffId)
                            AND (:status IS NULL OR s.handoverStatus = :status)
                            AND (:fromDate IS NULL OR s.checkInTime >= :fromDate)
                            AND (:toDate IS NULL OR s.checkInTime <= :toDate)
                            ORDER BY s.checkInTime DESC
                        """)
        Page<ShiftHandover> findHistory(
                        @Param("staffId") String staffId,
                        @Param("status") HandoverStatus status,
                        @Param("fromDate") Long fromDate,
                        @Param("toDate") Long toDate,
                        Pageable pageable);


}
