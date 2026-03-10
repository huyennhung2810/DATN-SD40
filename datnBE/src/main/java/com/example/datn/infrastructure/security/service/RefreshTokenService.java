package com.example.datn.infrastructure.security.service;

import com.example.datn.entity.Employee;
import com.example.datn.entity.RefreshToken;
import com.example.datn.infrastructure.security.repository.AuthRefreshTokenRepository;
import com.example.datn.infrastructure.security.repository.AuthStaffRepository;
import com.example.datn.infrastructure.security.user.UserPrincipal;
import com.example.datn.utils.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {
    private final long REFRESH_EXPIRED_TIME = 6 * 60 * 60 * 1000;

    private final AuthRefreshTokenRepository authRefreshTokenRepository;

    private final AuthStaffRepository staffRepository;

    public Optional<RefreshToken> findByToken(String token) {
        return authRefreshTokenRepository.findByRefreshToken(token);
    }

    public RefreshToken createRefreshToken(Authentication authentication) {

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        log.info("Creating new refresh token for user {}", principal.toString());

        Optional<Employee> staff = staffRepository.findByEmail(principal.getUsername());
        Optional<RefreshToken> optionalRefreshToken = authRefreshTokenRepository.findByUserId(principal.getId());

        if (optionalRefreshToken.isPresent()) {
            RefreshToken refreshToken = optionalRefreshToken.get();
            if (optionalRefreshToken.get().getRevokedAt() != null) {
                refreshToken.setRevokedAt(null);
                refreshToken.setExpiredAt(REFRESH_EXPIRED_TIME);
                refreshToken.setRefreshToken(UUID.randomUUID().toString());
                return authRefreshTokenRepository.save(refreshToken);
            }
            refreshToken.setExpiredAt(REFRESH_EXPIRED_TIME);
            refreshToken.setRefreshToken(UUID.randomUUID().toString());
            return authRefreshTokenRepository.save(refreshToken);
        }

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUserId(principal.getId());
        refreshToken.setExpiredAt(REFRESH_EXPIRED_TIME);
        refreshToken.setRefreshToken(UUID.randomUUID().toString());
        return authRefreshTokenRepository.save(refreshToken);
    }

    public RefreshToken createRefreshToken(String userID) {
        Optional<RefreshToken> optionalRefreshToken = authRefreshTokenRepository.findByUserId(userID);

        if (optionalRefreshToken.isPresent()) {
            RefreshToken refreshToken = optionalRefreshToken.get();
            if (optionalRefreshToken.get().getRevokedAt() != null) {
                refreshToken.setRevokedAt(null);
                refreshToken.setExpiredAt(REFRESH_EXPIRED_TIME);
                refreshToken.setRefreshToken(UUID.randomUUID().toString());
                return authRefreshTokenRepository.save(refreshToken);
            }
            refreshToken.setExpiredAt(REFRESH_EXPIRED_TIME);
            refreshToken.setRefreshToken(UUID.randomUUID().toString());
            return authRefreshTokenRepository.save(refreshToken);
        }

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUserId(userID);
        refreshToken.setExpiredAt(REFRESH_EXPIRED_TIME);
        refreshToken.setRefreshToken(UUID.randomUUID().toString());
        return authRefreshTokenRepository.save(refreshToken);
    }

    public RefreshToken verifyExpiration(RefreshToken refreshToken) {
        if(refreshToken.getExpiredAt() < DateTimeUtils.convertDateToTimeStampSecond(new Date())) {
            authRefreshTokenRepository.delete(refreshToken);
            return null;
        }

        return refreshToken ;
    }
}
