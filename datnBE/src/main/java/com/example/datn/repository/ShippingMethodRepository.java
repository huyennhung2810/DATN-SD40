package com.example.datn.repository;

import com.example.datn.entity.ShippingMethods;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShippingMethodRepository extends JpaRepository<ShippingMethods, String> {
}
