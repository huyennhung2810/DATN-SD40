package com.example.datn.core.admin.Employee.repository;

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

    @Query("SELECT COUNT(e) > 0 FROM Employee e WHERE e.identityCard = :cccd AND (:id IS NULL OR :id = '' OR e.id <> :id)")
    boolean existsByIdentityCardCustom(@Param("cccd") String cccd, @Param("id") String id);

    @Query("SELECT COUNT(e) > 0 FROM Employee e WHERE e.phoneNumber = :phone AND (:id IS NULL OR :id = '' OR e.id <> :id)")
    boolean existsByPhoneNumberCustom(@Param("phone") String phone, @Param("id") String id);

    @Query("SELECT COUNT(e) > 0 FROM Employee e WHERE e.email = :email AND (:id IS NULL OR :id = '' OR e.id <> :id)")
    boolean existsByEmailCustom(@Param("email") String email, @Param("id") String id);

    @Query("SELECT COUNT(a) > 0 FROM Account a WHERE a.username = :username AND (:id IS NULL OR :id = '' OR a.id <> (SELECT e.account.id FROM Employee e WHERE e.id = :id))")
    boolean existsByUsernameCustom(@Param("username") String username, @Param("id") String id);
}
