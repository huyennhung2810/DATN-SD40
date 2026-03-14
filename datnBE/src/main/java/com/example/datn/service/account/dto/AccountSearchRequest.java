package com.example.datn.service.account.dto;

import com.example.datn.core.common.base.PageableRequest;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.RoleConstant;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AccountSearchRequest extends PageableRequest {

    private String keyword;

    private EntityStatus status;

    @Enumerated(EnumType.STRING)
    private RoleConstant role;
}
