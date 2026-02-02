package com.example.datn.infrastructure.security.repository;

import com.example.datn.repository.AccountRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuthRoleRepository extends AccountRepository {
    @Query("""
    SELECT a.role
    FROM Account a
    WHERE a.username = :username
""")
    List<String> getRoleCodeByUsername(@Param("username") String username);

}
