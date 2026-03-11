package com.example.datn.service.account.dto;

import com.example.datn.infrastructure.constant.AuthProvider;
import com.example.datn.infrastructure.constant.RoleConstant;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AccountRequest {

    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(min = 3, max = 50, message = "Tên đăng nhập phải từ 3 đến 50 ký tự")
    private String username;

    @Size(min = 8, max = 100, message = "Mật khẩu phải có ít nhất 8 ký tự")
    private String password;

    private String confirmPassword;

    @NotNull(message = "Vai trò không được để trống")
    private RoleConstant role;

    private AuthProvider provider = AuthProvider.local;
}
