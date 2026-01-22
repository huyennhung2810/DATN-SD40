package com.example.datn.infrastructure.listener;

import jakarta.persistence.PrePersist;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;

@RequiredArgsConstructor(onConstructor_ = {@Autowired})

public class CreateAccountEntityListener {

//    public static PasswordEncoder passwordEncoder;
//
//    @PrePersist
//    public void prePersist(Account account) {
//        account.setPassword(passwordEncoder.encode(account.getPassword()));
//    }
}
