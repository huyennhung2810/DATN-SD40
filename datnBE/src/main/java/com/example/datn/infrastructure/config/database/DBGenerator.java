package com.example.datn.infrastructure.config.database;

import com.example.datn.entity.Account;
import com.example.datn.entity.Employee;
import com.example.datn.infrastructure.constant.RoleConstant;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.repository.AccountRepository;
import com.example.datn.repository.EmployeeRepository;
import com.example.datn.utils.SecurityUtils;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DBGenerator {

    private final AccountRepository accountRepository;
    private final EmployeeRepository employeeRepository;

    @Value("${db.generator.is-generated:true}")
    private String isGenerated;

    @Value("${db.generator.user-email:khanhabcd2005@gmail.com}")
    private String email;

    @Value("${db.generator.user-name:Nguyen Quoc Khanh}")
    private String userName;

    @Value("${db.generator.account-username:admin}")
    private String accountUsername;

    @Value("${db.generator.account-password:admin123}")
    private String accountPassword;

    @Value("${db.generator.role:ADMIN}")
    private String role;

    @PostConstruct
    public void init() {
        if("true".equals(isGenerated)) {
            generateData();
        }
    }

    private void generateData() {
        log.info("🔧 DBGenerator: Starting data generation...");

        // Check if account already exists
        Optional<Account> existingAccount = Optional.ofNullable(accountRepository.findByUsername(accountUsername));

        if (existingAccount.isEmpty()) {
            try {
                // Create Account
                Account account = new Account();
                account.setUsername(accountUsername);

                // Hash password using PBKDF2
                String[] hash = SecurityUtils.hashPassword(accountPassword);
                account.setSalt(hash[0]);
                account.setPassword(hash[1]);

                // Set role
                account.setRole(RoleConstant.valueOf(role));

                account = accountRepository.save(account);
                log.info("✅ DBGenerator: Created account with username: {}", accountUsername);

                // Create Employee linked to Account
                Optional<Employee> existingEmployee = employeeRepository.findByEmail(email);
                if (existingEmployee.isEmpty()) {
                    Employee employee = new Employee();
                    employee.setName(userName);
                    employee.setEmail(email);
                    employee.setCode("NV001");
                    employee.setStatus(EntityStatus.ACTIVE);
                    employee.setAccount(account);

                    employeeRepository.save(employee);
                    log.info("✅ DBGenerator: Created employee with email: {}", email);
                } else {
                    // Link existing employee to account
                    Employee employee = existingEmployee.get();
                    employee.setAccount(account);
                    employeeRepository.save(employee);
                    log.info("✅ DBGenerator: Linked existing employee to account");
                }

            } catch (Exception e) {
                log.error("❌ DBGenerator: Error generating data", e);
            }
        } else {
            log.info("ℹ️ DBGenerator: Account already exists, skipping creation");
        }

        log.info("🔧 DBGenerator: Data generation complete");
    }
}
