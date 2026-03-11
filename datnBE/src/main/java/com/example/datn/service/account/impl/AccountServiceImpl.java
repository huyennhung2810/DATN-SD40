package com.example.datn.service.account.impl;

import com.example.datn.entity.Account;
import com.example.datn.infrastructure.constant.AuthProvider;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.RoleConstant;
import com.example.datn.infrastructure.exception.ResourceNotFoundException;
import com.example.datn.infrastructure.exception.ValidationException;
import com.example.datn.repository.AccountRepository;
import com.example.datn.service.account.AccountService;
import com.example.datn.service.account.dto.AccountMapper;
import com.example.datn.service.account.dto.AccountRequest;
import com.example.datn.service.account.dto.AccountResponse;
import com.example.datn.service.account.dto.AccountSearchRequest;
import com.example.datn.service.account.dto.ResetPasswordRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private static final String PASSWORD_PATTERN = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";

    private final AccountRepository accountRepository;
    private final AccountMapper accountMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public AccountResponse create(AccountRequest request) {
        validateCreateRequest(request);

        Account account = accountMapper.toEntity(request);
        account.setCode(generateCode());
        account.setStatus(EntityStatus.ACTIVE);
        
        if (request.getProvider() != null) {
            account.setProvider(request.getProvider());
        } else {
            account.setProvider(AuthProvider.local);
        }

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            account.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        Account savedAccount = accountRepository.save(account);
        return accountMapper.toResponse(savedAccount);
    }

    @Override
    @Transactional
    public AccountResponse update(String id, AccountRequest request) {
        Account existingAccount = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại với id: " + id));

        validateUpdateRequest(request, id);

        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
            existingAccount.setUsername(request.getUsername().trim());
        }

        if (request.getRole() != null) {
            existingAccount.setRole(request.getRole());
        }

        Account updatedAccount = accountRepository.save(existingAccount);
        return accountMapper.toResponse(updatedAccount);
    }

    @Override
    @Transactional
    public void delete(String id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại với id: " + id));

        account.setStatus(EntityStatus.INACTIVE);
        accountRepository.save(account);
    }

    @Override
    public AccountResponse findById(String id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại với id: " + id));
        return accountMapper.toResponse(account);
    }

    @Override
    public Page<AccountResponse> search(AccountSearchRequest request) {
        Integer reqPage = request.getPage();
        Integer reqSize = request.getSize();

        int page = reqPage != null ? reqPage : 0;
        int size = reqSize != null ? reqSize : 10;

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdDate"));

        Specification<Account> spec = buildSpecification(request);

        Page<Account> accountPage = accountRepository.findAll(spec, pageable);
        return accountPage.map(accountMapper::toResponse);
    }

    @Override
    @Transactional
    public void updateStatus(String id, EntityStatus status) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại với id: " + id));

        account.setStatus(status);
        accountRepository.save(account);
    }

    @Override
    @Transactional
    public void resetPassword(String id, ResetPasswordRequest request) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại với id: " + id));

        validatePassword(request.getNewPassword(), request.getConfirmPassword());

        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);
    }

    private void validateCreateRequest(AccountRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new ValidationException("Tên đăng nhập không được để trống");
        }

        String username = request.getUsername().trim();
        if (username.length() < 3 || username.length() > 50) {
            throw new ValidationException("Tên đăng nhập phải từ 3 đến 50 ký tự");
        }

        if (accountRepository.existsByUsername(username)) {
            throw new ValidationException("Tên đăng nhập đã tồn tại");
        }

        if (request.getRole() == null) {
            throw new ValidationException("Vai trò không được để trống");
        }

        if (request.getProvider() == null || request.getProvider() == AuthProvider.local) {
            if (request.getPassword() == null || request.getPassword().isEmpty()) {
                throw new ValidationException("Mật khẩu không được để trống đối với tài khoản LOCAL");
            }
            validatePassword(request.getPassword(), request.getConfirmPassword());
        }
    }

    private void validateUpdateRequest(AccountRequest request, String excludeId) {
        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
            String username = request.getUsername().trim();
            if (username.length() < 3 || username.length() > 50) {
                throw new ValidationException("Tên đăng nhập phải từ 3 đến 50 ký tự");
            }

            Account existingByUsername = accountRepository.findByUsername(username);
            if (existingByUsername != null && !existingByUsername.getId().equals(excludeId)) {
                throw new ValidationException("Tên đăng nhập đã được sử dụng bởi tài khoản khác");
            }
        }

        if (request.getRole() != null) {
            if (request.getRole() != RoleConstant.ADMIN && request.getRole() != RoleConstant.STAFF) {
                throw new ValidationException("Vai trò chỉ được phép là ADMIN hoặc STAFF");
            }
        }
    }

    private void validatePassword(String password, String confirmPassword) {
        if (password == null || password.isEmpty()) {
            throw new ValidationException("Mật khẩu không được để trống");
        }

        if (password.length() < 8) {
            throw new ValidationException("Mật khẩu phải có ít nhất 8 ký tự");
        }

        if (!Pattern.matches(PASSWORD_PATTERN, password)) {
            throw new ValidationException("Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt");
        }

        if (confirmPassword == null || !password.equals(confirmPassword)) {
            throw new ValidationException("Xác nhận mật khẩu không khớp");
        }
    }

    private Specification<Account> buildSpecification(AccountSearchRequest request) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (request.getKeyword() != null && !request.getKeyword().trim().isEmpty()) {
                String keyword = "%" + request.getKeyword().trim() + "%";
                predicates.add(cb.or(
                    cb.like(root.get("code"), keyword),
                    cb.like(root.get("username"), keyword)
                ));
            }

            if (request.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), request.getStatus()));
            }

            if (request.getRole() != null) {
                predicates.add(cb.equal(root.get("role"), request.getRole()));
            }

            query.orderBy(cb.desc(root.get("createdDate")));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private String generateCode() {
        return "ACC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
