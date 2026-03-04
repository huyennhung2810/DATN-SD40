package com.example.datn.core.admin.techspec.service;

import com.example.datn.core.admin.techspec.model.request.VideoFormatRequest;
import com.example.datn.core.admin.techspec.model.request.VideoFormatSearchRequest;
import com.example.datn.core.admin.techspec.model.response.VideoFormatResponse;
import com.example.datn.core.common.base.PageableObject;

public interface VideoFormatService {
    PageableObject<VideoFormatResponse> search(VideoFormatSearchRequest request);
    VideoFormatResponse findById(String id);
    VideoFormatResponse create(VideoFormatRequest request);
    VideoFormatResponse update(String id, VideoFormatRequest request);
    void delete(String id);
}

