package com.example.datn.controller.admin.account;

import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.service.account.AccountService;
import com.example.datn.service.account.dto.AccountRequest;
import com.example.datn.service.account.dto.AccountResponse;
import com.example.datn.service.account.dto.AccountSearchRequest;
import com.example.datn.service.account.dto.ResetPasswordRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/accounts")
@RequiredArgsConstructor
public class AdminAccountController {

    private final AccountService accountService;

    @GetMapping
    public ResponseObject<Page<AccountResponse>> search(@ModelAttribute AccountSearchRequest request) {
        return ResponseObject.<Page<AccountResponse>>builder()
                .isSuccess(true)
                .status(HttpStatus.OK)
                .data(accountService.search(request))
                .build();
    }

    @GetMapping("/{id}")
    public ResponseObject<AccountResponse> findById(@PathVariable String id) {
        return ResponseObject.<AccountResponse>builder()
                .isSuccess(true)
                .status(HttpStatus.OK)
                .data(accountService.findById(id))
                .build();
    }

    @PostMapping
    public ResponseObject<AccountResponse> create(@Valid @RequestBody AccountRequest request) {
        return ResponseObject.<AccountResponse>builder()
                .isSuccess(true)
                .status(HttpStatus.CREATED)
                .data(accountService.create(request))
                .message("Tạo tài khoản thành công")
                .build();
    }

    @PutMapping("/{id}")
    public ResponseObject<AccountResponse> update(@PathVariable String id, @Valid @RequestBody AccountRequest request) {
        return ResponseObject.<AccountResponse>builder()
                .isSuccess(true)
                .status(HttpStatus.OK)
                .data(accountService.update(id, request))
                .message("Cập nhật tài khoản thành công")
                .build();
    }

    @DeleteMapping("/{id}")
    public ResponseObject<Void> delete(@PathVariable String id) {
        accountService.delete(id);
        return ResponseObject.<Void>builder()
                .isSuccess(true)
                .status(HttpStatus.OK)
                .message("Xóa tài khoản thành công")
                .build();
    }

    @PatchMapping("/{id}/status")
    public ResponseObject<Void> updateStatus(
            @PathVariable String id,
            @RequestParam EntityStatus status) {
        accountService.updateStatus(id, status);
        return ResponseObject.<Void>builder()
                .isSuccess(true)
                .status(HttpStatus.OK)
                .message("Cập nhật trạng thái thành công")
                .build();
    }

    @PostMapping("/{id}/reset-password")
    public ResponseObject<Void> resetPassword(
            @PathVariable String id,
            @Valid @RequestBody ResetPasswordRequest request) {
        accountService.resetPassword(id, request);
        return ResponseObject.<Void>builder()
                .isSuccess(true)
                .status(HttpStatus.OK)
                .message("Đặt lại mật khẩu thành công")
                .build();
    }
}
