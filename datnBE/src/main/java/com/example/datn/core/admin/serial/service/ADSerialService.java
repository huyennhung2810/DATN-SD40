package com.example.datn.core.admin.serial.service;

import com.example.datn.core.admin.serial.model.request.ADSerialRequest;
import com.example.datn.core.common.base.ResponseObject;

public interface ADSerialService {

    ResponseObject<?> getAllSerials();

    ResponseObject<?> findByProductDetailId(String productDetailId);

    ResponseObject<?> createSerial(ADSerialRequest request);

    ResponseObject<?> updateSerial(String serialId, ADSerialRequest request);


}
