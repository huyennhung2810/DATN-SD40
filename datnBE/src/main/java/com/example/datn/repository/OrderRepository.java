package com.example.datn.repository;

import com.example.datn.entity.Order;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {

    Optional<Order> findByCode(String code);
}
