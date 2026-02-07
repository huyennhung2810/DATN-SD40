package com.example.datn.core.admin.techspec.service;

import com.example.datn.core.admin.techspec.model.request.ResolutionRequest;
import com.example.datn.core.admin.techspec.model.request.ResolutionSearchRequest;
import com.example.datn.core.admin.techspec.model.response.ResolutionResponse;
import com.example.datn.core.common.base.PageableObject;

public interface ResolutionService {
    PageableObject<ResolutionResponse> search(ResolutionSearchRequest request);
    ResolutionResponse findById(String id);
    ResolutionResponse create(ResolutionRequest request);
    ResolutionResponse update(String id, ResolutionRequest request);
    void delete(String id);
}

