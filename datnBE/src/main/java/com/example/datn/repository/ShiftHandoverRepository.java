package com.example.datn.repository;

import com.example.datn.entity.ShiftHandover;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShiftHandoverRepository extends JpaRepository<ShiftHandover, String> {
}
