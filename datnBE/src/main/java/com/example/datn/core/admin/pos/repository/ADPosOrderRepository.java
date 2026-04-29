package com.example.datn.core.admin.pos.repository;

import com.example.datn.entity.Order;
import com.example.datn.infrastructure.constant.OrderStatus;
import com.example.datn.infrastructure.constant.TypeInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ADPosOrderRepository extends JpaRepository<Order, String> {

    // Đếm số lượng hóa đơn theo trạng thái và loại
    long countByOrderStatusAndOrderType(OrderStatus orderStatus, TypeInvoice orderType);

    // Lấy danh sách hóa đơn theo trạng thái và loại
    List<Order> findByOrderStatusAndOrderType(OrderStatus orderStatus, TypeInvoice orderType);

    // Tìm đơn hàng theo mã code (VD: OTH59798424)
    java.util.Optional<Order> findByCode(String code);
}
