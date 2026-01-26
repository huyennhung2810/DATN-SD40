package com.example.datn.core.admin.customer.service;

import com.example.datn.core.admin.customer.model.request.ADStorageCapacityRequest;
import com.example.datn.core.common.base.ResponseObject;

public interface ADStorageCapacityService {

    ResponseObject<?> getAllStorageCapacity();

    ResponseObject<?> getStorageCapacityByCode(String code);

    ResponseObject<?> createStorageCapacity(ADStorageCapacityRequest request);

    ResponseObject<?> updateStorageCapacity(String storageCapacityId, ADStorageCapacityRequest request);

    ResponseObject<?> deleteStorageCapacity(String storageCapacityId);
}
