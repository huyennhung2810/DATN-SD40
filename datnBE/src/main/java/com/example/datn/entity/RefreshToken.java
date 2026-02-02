package com.example.datn.entity;

import com.example.datn.entity.base.PrimaryEntity;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "refresh_token")
public class RefreshToken extends PrimaryEntity implements Serializable {

    @Column(name = "refresh_token", length = 8000)
    private String refreshToken;

    @Column(name = "expired_at")
    private Long expiredAt;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "revoked_at")
    private Long revokedAt;
}
