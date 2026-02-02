package com.example.datn.entity;

import com.example.datn.entity.base.PrimaryEntity;
import com.example.datn.infrastructure.constant.RoleConstant;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "account")
@Builder
public class Account extends PrimaryEntity implements Serializable {

    @Column(name = "username")
    private String username;

    @Column(name = "password")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Column(name = "salt")
    private String salt;

    @Column(name = "otp_code")
    private String otpCode;

    @Column(name = "otp_expiry_time")
    private Long otpExpiryTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private RoleConstant role;
}
