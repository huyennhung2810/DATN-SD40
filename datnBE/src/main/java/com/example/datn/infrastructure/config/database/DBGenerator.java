package com.example.datn.infrastructure.config.database;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
//import org.springframework.security.crypto.password.PasswordEncoder;

@Component
@RequiredArgsConstructor
public class DBGenerator {
//
//    @Value("${db.generator.is-generated}")
//    private String isGenerated;
//
//    @Value("${db.generator.user-email}")
//    private String email;
//
//    @Value("${db.generator.user-name}")
//    private String username;
//
//    @Value("${db.generator.account-username}")
//    private String accountUsername;
//
//    @Value("${db.generator.account-password}")
//    private String accountPassword;
//
//    private final DBAccountRepository accountRepository;
//
//    private final DBStaffRepository staffRepository;
//
//    private final DBRoleRepository roleRepository;
//
//    private final PasswordEncoder passwordEncoder;
//
//    @PostConstruct
//    public void init() {
//        if("true".equals(isGenerated)) {
//            generateDate();
//        }
//    }
//
//    private void generateDate() {
//        List<Role> roles = roleRepository.findAll();
//
//        if(roles.isEmpty()) {
//            generateRole();
//        }
//
//        Role role = roleRepository.findByCode(RoleConstant.QUAN_LY.name());
//
//        Optional<Account> optionalAccount = accountRepository.findByUsername(accountUsername);
//
//        if(optionalAccount.isEmpty()) {
//            Account account = new Account();
//            account.setUsername(accountUsername);
//            account.setPassword(passwordEncoder.encode(accountPassword));
//            account.setRoleConstant(RoleConstant.QUAN_LY);
//            accountRepository.save(account);
//        }
//
//        Optional<Staff> optionalStaff = staffRepository.findByEmail(email);
//
//        if(optionalStaff.isEmpty()) {
//            Staff staff = new Staff();
//            staff.setEmail(email);
//            staff.setCode(Helper.generateCodeFromName(username));
//            staff.setName(username);
//
//            Optional<Account> account = accountRepository.findByUsername(accountUsername);
//
//            staff.setAccount(account.orElse(null));
//            staffRepository.save(staff);
//        }
//    }
//
//    private void generateRole() {
//        List<String> codeRoles = RoleConstant.getAllRoles();
//
//        List<String> nameRoles = RoleConstant.getAllRolesInVietnamese();
//
//        for (int i = 0; i < 3; i++) {
//            Role role = new Role();
//            role.setCode(codeRoles.get(i));
//            role.setName(nameRoles.get(i));
//            roleRepository.save(role);
//        }
//    }
}
