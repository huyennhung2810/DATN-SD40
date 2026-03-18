package com.example.datn.core.admin.brand.service;

import com.example.datn.core.admin.brand.model.request.ADBrandRequest;
import com.example.datn.core.admin.brand.model.request.ADBrandSearchRequest;
import com.example.datn.core.admin.brand.model.response.ADBrandResponse;
import com.example.datn.core.common.base.PageableObject;

public interface ADBrandService {
    PageableObject<ADBrandResponse> search(ADBrandSearchRequest request);
    ADBrandResponse create(ADBrandRequest request);
    ADBrandResponse update(String id, ADBrandRequest request);
    void delete(String id);
    ADBrandResponse findById(String id);
}
