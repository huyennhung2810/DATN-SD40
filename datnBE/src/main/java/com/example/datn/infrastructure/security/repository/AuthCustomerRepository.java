package com.example.datn.infrastructure.security.repository;

import com.example.datn.entity.Customer;
import com.example.datn.repository.CustomerRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuthCustomerRepository extends CustomerRepository {
    Optional<Customer> findByEmail(String email);
}
