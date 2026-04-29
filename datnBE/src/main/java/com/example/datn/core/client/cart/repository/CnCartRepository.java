package com.example.datn.core.client.cart.repository;

import com.example.datn.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CnCartRepository extends JpaRepository<Cart, String> {

    // Tìm giỏ hàng theo ID của Customer (dùng findFirst để tránh lỗi non-unique nếu có dữ liệu trùng)
    Optional<Cart> findFirstByCustomer_Id(String customerId);
}
