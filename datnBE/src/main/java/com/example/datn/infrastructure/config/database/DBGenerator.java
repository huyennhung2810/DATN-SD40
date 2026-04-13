package com.example.datn.infrastructure.config.database;

import com.example.datn.core.admin.employee.repository.ADEmployeeRepository;
import com.example.datn.entity.Account;
import com.example.datn.entity.Employee;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.RoleConstant;
import com.example.datn.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DBGenerator implements CommandLineRunner {

    private final ADEmployeeRepository employeeRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${db.generator.is-generated}")
    private boolean isGenerated;

    @Value("${USER_USERNAME}")
    private String fixedUsername;

    @Value("${USER_PASSWORD}")
    private String fixedPassword;

    @Value("${USER_EMAIL}")
    private String adminEmail;

    @Value("${USER_NAME}")
    private String adminName;

    @Value("${USER_CODE}")
    private String adminCode;

    @Override
    public void run(String... args) throws Exception {
        if (!isGenerated) return;

        if (accountRepository.existsByUsername(fixedUsername)) {
            System.out.println(">>> Tài khoản Admin [" + fixedUsername + "] đã sẵn sàng.");
            return;
        }

        System.out.println(">>> Database trống, đang khởi tạo quyền truy cập cho Nhung...");

        try {
            Account adminAccount = new Account();
            adminAccount.setUsername(fixedUsername);
            adminAccount.setPassword(passwordEncoder.encode(fixedPassword));
            adminAccount.setRole(RoleConstant.ADMIN);
            adminAccount.setStatus(EntityStatus.ACTIVE);

            Account savedAccount = accountRepository.save(adminAccount);

            Employee adminEmployee = new Employee();
            adminEmployee.setAccount(savedAccount);
            adminEmployee.setCode(adminCode);
            adminEmployee.setName(adminName);
            adminEmployee.setEmail(adminEmail);
            adminEmployee.setPhoneNumber("0979085701");
            adminEmployee.setStatus(EntityStatus.ACTIVE);

            employeeRepository.save(adminEmployee);

            System.out.println("====================================================");
            System.out.println("   KHỞI TẠO TÀI KHOẢN ADMIN THÀNH CÔNG!             ");
            System.out.println("   Username: " + fixedUsername);
            System.out.println("   Password: " + fixedPassword);
            System.out.println("====================================================");
            System.out.println("---Sẵn Tài Khoản Mật Khẩu...");

        } catch (Exception e) {
            System.err.println(">>> Lỗi seeding dữ liệu: " + e.getMessage());
        }
    }
}
