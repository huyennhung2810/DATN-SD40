package com.example.datn.infrastructure.security.repository;

import com.example.datn.entity.RefreshToken;
import com.example.datn.repository.RefreshTokenAuthRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuthRefreshTokenRepository extends RefreshTokenAuthRepository {
    Optional<RefreshToken> findByRefreshToken(String refreshToken);

    Optional<RefreshToken> findByUserId(String userId);
}
