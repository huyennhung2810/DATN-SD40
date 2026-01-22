package com.example.datn.core.admin.Employee.service;

import com.example.datn.core.admin.Employee.model.request.ADEmployeeRequest;
import com.example.datn.core.admin.Employee.model.request.ADEmployeeSearchRequest;
import com.example.datn.core.common.base.ResponseObject;

public interface ADEmployeeService {

    ResponseObject<?> getAllEmployee(ADEmployeeSearchRequest request);

    ResponseObject<?> getEmployeeById(String id);

    ResponseObject<?> addEmployee(ADEmployeeRequest request);

    ResponseObject<?> updateEmployee(ADEmployeeRequest request);

    ResponseObject<?> changeEmployeeStatus(String id);

    ResponseObject<?> changeEmployeeRole(String id);

    byte[] exportAllEmployees();
    ResponseObject<?> checkDuplicate(String identityCard, String phoneNumber, String email, String id);

}
