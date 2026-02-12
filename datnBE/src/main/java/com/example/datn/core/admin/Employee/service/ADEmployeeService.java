package com.example.datn.core.admin.Employee.service;

import com.example.datn.core.admin.Employee.model.request.ADEmployeeRequest;
import com.example.datn.core.admin.Employee.model.request.ADEmployeeSearchRequest;
import com.example.datn.core.common.base.ResponseObject;
import org.springframework.transaction.annotation.Transactional;

public interface ADEmployeeService {

    ResponseObject<?> getAllEmployee(ADEmployeeSearchRequest request);

    ResponseObject<?> getEmployeeById(String id);

    ResponseObject<?> addEmployee(ADEmployeeRequest request);

    ResponseObject<?> updateEmployee(ADEmployeeRequest request);

    ResponseObject<?> changeEmployeeStatus(String id);

    @Transactional
    ResponseObject<?> resetPasswordWithOTP(String email, String otpInput, String newPassword);

    @Transactional
    ResponseObject<?> requestForgotPassword(String email);

    byte[] exportAllEmployees();
    ResponseObject<?> checkDuplicate(String identityCard, String phoneNumber, String email, String id, String username);

    @Transactional
    ResponseObject<?> changePassword(String username, com.example.datn.core.admin.Employee.model.request.ADChangePasswordRequest request);
}
