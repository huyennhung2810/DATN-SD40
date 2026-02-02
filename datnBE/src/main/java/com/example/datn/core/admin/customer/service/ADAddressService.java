package com.example.datn.core.admin.customer.service;

import com.example.datn.core.admin.customer.model.request.ADAddressRequest;
import com.example.datn.core.common.base.ResponseObject;

public interface ADAddressService {

    ResponseObject<?> getByCustomer(String customerId);

    ResponseObject<?> createOrUpdate(String customerId, ADAddressRequest request);

    ResponseObject<?> delete(String id);

    ResponseObject<?> setDefault(String id);
}
