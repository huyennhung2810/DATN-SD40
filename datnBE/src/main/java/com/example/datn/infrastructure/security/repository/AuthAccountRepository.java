package com.example.datn.infrastructure.security.repository;

import com.example.datn.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuthAccountRepository extends JpaRepository<Account, String> {
    // Tìm tài khoản theo email (rất quan trọng cho OAuth2)
    Optional<Account> findByEmail(String email);

    // Kiểm tra xem username đã tồn tại chưa
    boolean existsByUsername(String username);

    // Tìm account theo username, dùng findFirst để tránh NonUniqueResultException khi có dữ liệu trùng
    Account findFirstByUsername(String username);
}