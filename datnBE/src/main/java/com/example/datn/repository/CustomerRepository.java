package com.example.datn.repository;

import com.example.datn.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {
    Optional<Customer> findByAccount_Id(String accountId);

    Optional<Customer> findByPhoneNumber(String phone);
}
