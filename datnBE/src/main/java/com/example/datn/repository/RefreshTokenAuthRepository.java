package com.example.datn.repository;

import com.example.datn.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RefreshTokenAuthRepository extends JpaRepository<RefreshToken, String> {
}
