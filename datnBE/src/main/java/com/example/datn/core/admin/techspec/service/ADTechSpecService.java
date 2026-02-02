package com.example.datn.core.admin.techspec.service;

import com.example.datn.core.admin.techspec.model.request.ADTechSpecRequest;
import com.example.datn.core.admin.techspec.model.request.ADTechSpecSearchRequest;
import com.example.datn.core.admin.techspec.model.response.ADTechSpecResponse;
import com.example.datn.core.common.base.PageableObject;

public interface ADTechSpecService {
    PageableObject<ADTechSpecResponse> search(ADTechSpecSearchRequest request);
    ADTechSpecResponse create(ADTechSpecRequest request);
    ADTechSpecResponse update(String id, ADTechSpecRequest request);
    void delete(String id);
    ADTechSpecResponse findById(String id);
}