package com.example.datn.infrastructure.job.imei.service;

import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.job.common.model.request.EXDataRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

public interface SerialNumberExcelService {

    ResponseEntity<?> downloadTemplate(EXDataRequest request);

    ResponseObject<?> importExcelSerialNumber(MultipartFile file);
}
