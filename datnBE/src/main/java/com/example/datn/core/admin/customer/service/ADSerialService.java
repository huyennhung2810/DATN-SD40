package com.example.datn.core.admin.customer.service;

import com.example.datn.core.admin.customer.model.request.ADAddressRequest;
import com.example.datn.core.admin.customer.model.request.ADSerialRequest;
import com.example.datn.core.common.base.ResponseObject;

public interface ADSerialService {

    ResponseObject<?> getAllSerials();

    ResponseObject<?> findByProductDetailId(String productDetailId);

    ResponseObject<?> createSerial(ADSerialRequest request);

    ResponseObject<?> updateSerial(String serialId, ADSerialRequest request);


}
