package com.example.datn.core.client.order.repository;

import com.example.datn.entity.Order;
import com.example.datn.infrastructure.constant.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CnOrderRepository extends JpaRepository<Order, String> {

    @Query("SELECT o FROM Order o WHERE o.customer.id = :customerId ORDER BY o.createdDate DESC")
    Page<Order> findByCustomerId(@Param("customerId") String customerId, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.customer.id = :customerId AND o.orderStatus = :status ORDER BY o.createdDate DESC")
    Page<Order> findByCustomerIdAndStatus(
            @Param("customerId") String customerId,
            @Param("status") OrderStatus status,
            Pageable pageable);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderHistories WHERE o.id = :orderId")
    Optional<Order> findByIdWithHistories(@Param("orderId") String orderId);

    @Query("SELECT o FROM Order o WHERE o.customer.id = :customerId AND o.code LIKE :code ORDER BY o.createdDate DESC")
    Page<Order> findByCustomerIdAndCodeLike(@Param("customerId") String customerId, @Param("code") String code,
            Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.customer.id = :customerId AND o.orderStatus = :status AND o.code LIKE :code ORDER BY o.createdDate DESC")
    Page<Order> findByCustomerIdAndStatusAndCodeLike(@Param("customerId") String customerId,
            @Param("status") OrderStatus status, @Param("code") String code, Pageable pageable);
}
