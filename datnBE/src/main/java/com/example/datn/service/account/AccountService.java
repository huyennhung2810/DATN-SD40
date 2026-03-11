package com.example.datn.service.account;

import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.service.account.dto.AccountRequest;
import com.example.datn.service.account.dto.AccountResponse;
import com.example.datn.service.account.dto.AccountSearchRequest;
import com.example.datn.service.account.dto.ResetPasswordRequest;
import org.springframework.data.domain.Page;

public interface AccountService {

    AccountResponse create(AccountRequest request);

    AccountResponse update(String id, AccountRequest request);

    void delete(String id);

    AccountResponse findById(String id);

    Page<AccountResponse> search(AccountSearchRequest request);

    void updateStatus(String id, EntityStatus status);

    void resetPassword(String id, ResetPasswordRequest request);
}
