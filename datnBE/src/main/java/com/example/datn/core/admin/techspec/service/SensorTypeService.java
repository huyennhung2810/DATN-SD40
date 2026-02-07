package com.example.datn.core.admin.techspec.service;

import com.example.datn.core.admin.techspec.model.request.SensorTypeRequest;
import com.example.datn.core.admin.techspec.model.request.SensorTypeSearchRequest;
import com.example.datn.core.admin.techspec.model.response.SensorTypeResponse;
import com.example.datn.core.common.base.PageableObject;

public interface SensorTypeService {
    PageableObject<SensorTypeResponse> search(SensorTypeSearchRequest request);
    SensorTypeResponse findById(String id);
    SensorTypeResponse create(SensorTypeRequest request);
    SensorTypeResponse update(String id, SensorTypeRequest request);
    void delete(String id);
}

