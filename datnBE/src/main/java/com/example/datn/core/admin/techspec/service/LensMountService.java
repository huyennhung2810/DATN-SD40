package com.example.datn.core.admin.techspec.service;

import com.example.datn.core.admin.techspec.model.request.LensMountRequest;
import com.example.datn.core.admin.techspec.model.request.LensMountSearchRequest;
import com.example.datn.core.admin.techspec.model.response.LensMountResponse;
import com.example.datn.core.common.base.PageableObject;

public interface LensMountService {
    PageableObject<LensMountResponse> search(LensMountSearchRequest request);
    LensMountResponse findById(String id);
    LensMountResponse create(LensMountRequest request);
    LensMountResponse update(String id, LensMountRequest request);
    void delete(String id);
}

