package com.example.datn.infrastructure.config.database.repository;

import com.example.datn.entity.Account;
import com.example.datn.repository.AccountRepository;

import java.util.Optional;

public interface DBAccountRepository extends AccountRepository {

    Optional<Account> findByUsername(String username);
}
