package com.example.datn.core.admin.order.repository;

import com.example.datn.entity.Order;
import com.example.datn.infrastructure.constant.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ADOrderRepository extends JpaRepository<Order, String> {

    @Query("SELECT o FROM Order o WHERE " +
            "(:status IS NULL OR o.orderStatus = :status) AND " +
            "(:keyword IS NULL OR :keyword = '' OR o.code LIKE %:keyword% OR o.recipientName LIKE %:keyword% OR o.recipientPhone LIKE %:keyword%) "
            +
            "ORDER BY o.createdDate DESC")
    Page<Order> searchOrders(@Param("status") OrderStatus status, @Param("keyword") String keyword, Pageable pageable);
}
