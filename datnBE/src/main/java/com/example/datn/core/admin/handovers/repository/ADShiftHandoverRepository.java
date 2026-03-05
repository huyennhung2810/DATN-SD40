package com.example.datn.core.admin.handovers.repository;

import com.example.datn.entity.ShiftHandover;
import com.example.datn.repository.ShiftHandoverRepository;
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

    // ✅ SỬA: bỏ LIMIT và dùng method name query (chuẩn nhất)
    Optional<ShiftHandover>
    findTopByHandoverStatusOrderByCheckOutTimeDesc(String handoverStatus);


    @Query("""
    SELECT COALESCE(SUM(o.totalAmount), 0)
    FROM Order o
    WHERE o.employee.id = :empId
    AND o.paymentMethod = 'CASH'
    AND o.orderStatus = com.example.datn.infrastructure.constant.OrderStatus.COMPLETED
    AND o.createdDate BETWEEN :startTime AND :endTime
""")
    BigDecimal sumCashRevenue(@Param("empId") String empId,
                              @Param("startTime") LocalDateTime startTime,
                              @Param("endTime") LocalDateTime endTime);

    @Query("""
    SELECT COALESCE(SUM(o.totalAmount), 0)
    FROM Order o
    WHERE o.employee.id = :empId
    AND o.paymentMethod = 'TRANSFER'
    AND o.orderStatus = com.example.datn.infrastructure.constant.OrderStatus.COMPLETED
    AND o.createdDate BETWEEN :startTime AND :endTime
""")
    BigDecimal sumTransferRevenue(@Param("empId") String empId,
                                  @Param("startTime") LocalDateTime startTime,
                                  @Param("endTime") LocalDateTime endTime);

}
