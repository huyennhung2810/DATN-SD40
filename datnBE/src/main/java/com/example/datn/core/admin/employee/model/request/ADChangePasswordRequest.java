package com.example.datn.core.admin.employee.model.request;

import lombok.Data;

@Data
public class ADChangePasswordRequest {

    private String oldPassword;
    private String newPassword;
}
