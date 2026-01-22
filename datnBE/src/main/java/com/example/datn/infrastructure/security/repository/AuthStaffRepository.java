package com.example.datn.infrastructure.security.repository;

import com.example.datn.entity.Employee;
import com.example.datn.repository.EmployeeRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuthStaffRepository extends EmployeeRepository {
    @Query(value = """
    SELECT e
        from Employee e JOIN Account a on e.account.id = a.id
        WHERE a.username = :username
    """)
    Optional<Employee> findByUsername(@Param("username") String username);

    Optional<Employee> findByEmail(String email);
}
