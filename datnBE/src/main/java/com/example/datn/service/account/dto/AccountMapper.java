package com.example.datn.service.account.dto;

import com.example.datn.entity.Account;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class AccountMapper {

    public AccountResponse toResponse(Account account) {
        if (account == null) {
            return null;
        }
        return AccountResponse.builder()
                .id(account.getId())
                .code(account.getCode())
                .username(account.getUsername())
                .role(account.getRole())
                .status(account.getStatus())
                .provider(account.getProvider())
                .createdDate(account.getCreatedDate())
                .lastModifiedDate(account.getLastModifiedDate())
                .build();
    }

    public List<AccountResponse> toResponseList(List<Account> accounts) {
        if (accounts == null) {
            return null;
        }
        return accounts.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public Account toEntity(AccountRequest request) {
        if (request == null) {
            return null;
        }
        return Account.builder()
                .username(request.getUsername())
                .role(request.getRole())
                .build();
    }
}
