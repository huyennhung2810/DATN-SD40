package com.example.datn.core.admin.techspec.service;

import com.example.datn.core.admin.techspec.model.request.ProcessorRequest;
import com.example.datn.core.admin.techspec.model.request.ProcessorSearchRequest;
import com.example.datn.core.admin.techspec.model.response.ProcessorResponse;
import com.example.datn.core.common.base.PageableObject;

public interface ProcessorService {
    PageableObject<ProcessorResponse> search(ProcessorSearchRequest request);
    ProcessorResponse findById(String id);
    ProcessorResponse create(ProcessorRequest request);
    ProcessorResponse update(String id, ProcessorRequest request);
    void delete(String id);
}

