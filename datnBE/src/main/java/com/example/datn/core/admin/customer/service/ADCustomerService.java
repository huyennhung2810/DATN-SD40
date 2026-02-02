package com.example.datn.core.admin.customer.service;


import com.example.datn.core.admin.customer.model.request.ADCustomerRequest;
import com.example.datn.core.admin.customer.model.request.ADCustomerSearchRequest;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.job.common.model.request.EXUploadRequest;
import com.example.datn.infrastructure.job.common.model.response.ExImportLogResponse;
import org.springframework.transaction.annotation.Transactional;

public interface ADCustomerService {

    ResponseObject<?> getAllCustomer(ADCustomerSearchRequest request);

    ResponseObject<?> getCustomerById(String id);

    ResponseObject<?> addCustomer(ADCustomerRequest request);

    ResponseObject<?> updateCustomer(ADCustomerRequest request);

    ResponseObject<?> changeCustomerStatus(String id);

    byte[] exportAllCustomers();

    ResponseObject<?> checkDuplicate(String identityCard, String phoneNumber, String email, String id);
}
