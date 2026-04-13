package com.example.datn.repository;

import com.example.datn.entity.Order;
import com.example.datn.entity.OrderHistory;
import com.example.datn.infrastructure.constant.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderHistoryRepository extends JpaRepository<OrderHistory, String> {

    // Đã đổi HoaDon -> Order
    List<OrderHistory> findByOrderOrderByThoiGianDesc(Order order);

    // Đã đổi HoaDon -> Order
    Optional<OrderHistory> findFirstByOrderAndTrangThaiOrderByThoiGianDesc(
            Order order,
            OrderStatus trangThai);

    // Đã đổi HoaDon -> Order
    List<OrderHistory> findByOrderOrderByThoiGianAsc(Order order);
}