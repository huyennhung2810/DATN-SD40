package com.example.datn.infrastructure.security.repository;

import com.example.datn.entity.Customer;
import com.example.datn.repository.CustomerRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuthCustomerRepository extends CustomerRepository {
    Optional<Customer> findByEmail(String email);


    @Query("SELECT c FROM Customer c JOIN Account a ON c.account.id = a.id WHERE a.username = :username")
    Optional<Customer> findByAccountUsername(@Param("username") String username);

    boolean existsByPhoneNumber(String phoneNumber);
}
