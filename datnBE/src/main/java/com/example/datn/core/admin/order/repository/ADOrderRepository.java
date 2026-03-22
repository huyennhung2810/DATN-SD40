package com.example.datn.core.admin.order.repository;

import com.example.datn.core.admin.order.model.request.ADOrderSearchRequest;
import com.example.datn.core.admin.order.model.response.OrderPageResponse;
import com.example.datn.entity.Order;
import com.example.datn.infrastructure.constant.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface ADOrderRepository extends JpaRepository<Order, String> {
    

    @Query("SELECT h FROM Order h WHERE h.code = :ma")
    Optional<Order> findByMa(@Param("ma") String ma);

    @Query("SELECT h FROM Order h WHERE h.id = :id")
    Order findByOrderId(@Param("id") String id);

    @Query("""
        SELECT SUM(i.totalAmount)
        FROM Order i
        WHERE i.shiftHandover.id = :shiftId
          AND i.orderStatus = :status
    """)
    BigDecimal sumTotalAmountByShiftId(
            @Param("shiftId") String shiftId,
            @Param("status") OrderStatus status
    );

    @Query("""
        SELECT COUNT(i)
        FROM Order i
        WHERE i.shiftHandover.id = :shiftId
          AND i.orderStatus = :status
    """)
    Integer countTotalInvoices(
            @Param("shiftId") String shiftId,
            @Param("status") OrderStatus status
    );
}
