package com.example.datn.service.account.dto;

import com.example.datn.infrastructure.constant.AuthProvider;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.RoleConstant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountResponse {

    private String id;

    private String code;

    private String username;

    private RoleConstant role;

    private EntityStatus status;

    private AuthProvider provider;

    private Long createdDate;

    private Long lastModifiedDate;
}
