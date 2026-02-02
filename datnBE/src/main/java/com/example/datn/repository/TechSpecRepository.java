package com.example.datn.repository;

import com.example.datn.entity.TechSpec;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TechSpecRepository extends JpaRepository<TechSpec, String> {
}
