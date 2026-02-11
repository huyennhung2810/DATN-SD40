package com.example.datn.core.admin.serial.service;

import com.example.datn.core.admin.serial.model.request.ADSerialRequest;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.EntityStatus;
import org.springframework.http.ResponseEntity;

public interface ADSerialService {

    ResponseObject<?> getAllSerials();

    ResponseObject<?> findById(String id);

    ResponseObject<?> findByProductDetailId(String productDetailId);

    ResponseEntity<?> createSerial(ADSerialRequest request);

    ResponseEntity<?> updateSerial(String serialId, ADSerialRequest request);

//    ResponseObject<?> changeSerialStatus(String serialId, Integer status);


}
