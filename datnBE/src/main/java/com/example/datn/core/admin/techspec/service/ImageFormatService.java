package com.example.datn.core.admin.techspec.service;

import com.example.datn.core.admin.techspec.model.request.ImageFormatRequest;
import com.example.datn.core.admin.techspec.model.request.ImageFormatSearchRequest;
import com.example.datn.core.admin.techspec.model.response.ImageFormatResponse;
import com.example.datn.core.common.base.PageableObject;

public interface ImageFormatService {
    PageableObject<ImageFormatResponse> search(ImageFormatSearchRequest request);
    ImageFormatResponse findById(String id);
    ImageFormatResponse create(ImageFormatRequest request);
    ImageFormatResponse update(String id, ImageFormatRequest request);
    void delete(String id);
}

