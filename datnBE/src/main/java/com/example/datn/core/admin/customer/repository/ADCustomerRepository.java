package com.example.datn.core.admin.customer.repository;

import com.example.datn.entity.Customer;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.repository.CustomerRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ADCustomerRepository extends CustomerRepository {
    @Query("""
        SELECT c FROM Customer c 
        WHERE (:keyword IS NULL OR :keyword = '' 
           OR LOWER(c.code) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR c.phoneNumber LIKE CONCAT('%', :keyword, '%'))
        AND (:status IS NULL OR c.status = :status)
        AND (:gender IS NULL OR c.gender = :gender)
        ORDER BY c.createdDate DESC 
    """)
    Page<Customer> getAllCustomer(
            Pageable pageable,
            @Param("keyword") String keyword,
            @Param("status") EntityStatus status,
            @Param("gender") Boolean gender
    );

    // Kiểm tra trùng CCCD
    boolean existsByIdentityCardAndIdNot(String identityCard, String id);
    boolean existsByIdentityCard(String identityCard);

    // Kiểm tra trùng Số điện thoại
    boolean existsByPhoneNumberAndIdNot(String phoneNumber, String id);
    boolean existsByPhoneNumber(String phoneNumber);

    // Kiểm tra trùng Email
    boolean existsByEmailAndIdNot(String email, String id);
    boolean existsByEmail(String email);
}