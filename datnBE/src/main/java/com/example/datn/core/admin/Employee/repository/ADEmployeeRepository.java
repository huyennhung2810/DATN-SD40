package com.example.datn.core.admin.Employee.repository;

import com.example.datn.entity.Customer;
import com.example.datn.entity.Employee;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.RoleConstant;
import com.example.datn.repository.EmployeeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ADEmployeeRepository extends EmployeeRepository {

    // Tại file ADEmployeeRepository.java
    @Query("""
    SELECT e FROM Employee e 
    LEFT JOIN e.account a
    WHERE (:keyword IS NULL OR :keyword = '' 
       OR LOWER(e.code) LIKE LOWER(CONCAT('%', :keyword, '%'))
       OR LOWER(e.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
       OR LOWER(e.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
       OR e.phoneNumber LIKE CONCAT('%', :keyword, '%'))
    AND (:status IS NULL OR e.status = :status)
    AND (:gender IS NULL OR e.gender = :gender)
    AND (:role IS NULL OR a.role = :role) 
    ORDER BY e.lastModifiedDate DESC 
""")
    Page<Employee> getAllEmployee(
            Pageable pageable,
            @Param("keyword") String keyword,
            @Param("status") EntityStatus status,
            @Param("gender") Boolean gender,
            @Param("role") RoleConstant role
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
