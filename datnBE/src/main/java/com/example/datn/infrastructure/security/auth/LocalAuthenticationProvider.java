package com.example.datn.infrastructure.security.auth;

import com.example.datn.entity.Account;
import com.example.datn.entity.Employee;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.security.repository.AuthRoleRepository;
import com.example.datn.infrastructure.security.repository.AuthStaffRepository;
import com.example.datn.infrastructure.security.user.UserPrincipal;
import com.example.datn.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;

import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class LocalAuthenticationProvider implements AuthenticationProvider {

    private final AuthStaffRepository staffRepository;
    private final AuthRoleRepository roleRepository;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String usernameOrEmail = authentication.getName();
        String rawPassword = authentication.getCredentials() == null ? null : authentication.getCredentials().toString();

        if (usernameOrEmail == null || usernameOrEmail.isBlank() || rawPassword == null || rawPassword.isBlank()) {
            throw new BadCredentialsException("Tên đăng nhập hoặc mật khẩu không được để trống");
        }

        Optional<Employee> optionalEmployee = usernameOrEmail.contains("@")
                ? staffRepository.findByEmail(usernameOrEmail)
                : staffRepository.findByUsername(usernameOrEmail);

        if (optionalEmployee.isEmpty()) {
            throw new BadCredentialsException("Tài khoản hoặc mật khẩu không đúng");
        }

        Employee employee = optionalEmployee.get();

        if (employee.getStatus() != null && employee.getStatus() == EntityStatus.INACTIVE) {
            throw new DisabledException("Tài khoản đã bị vô hiệu hóa");
        }

        Account account = employee.getAccount();
        if (account == null || account.getPassword() == null || account.getSalt() == null) {
            throw new BadCredentialsException("Tài khoản này không hỗ trợ đăng nhập bằng mật khẩu");
        }

        boolean ok;
        try {
            ok = SecurityUtils.verifyPassword(rawPassword, account.getSalt(), account.getPassword());
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            log.error("Password verification failed", e);
            throw new BadCredentialsException("Xác thực mật khẩu thất bại");
        }

        if (!ok) {
            throw new BadCredentialsException("Tài khoản hoặc mật khẩu không đúng");
        }

        List<String> roles = roleRepository.getRoleCodeByUsername(account.getUsername());
        UserPrincipal principal = UserPrincipal.create(employee, roles);
        return new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }
}
