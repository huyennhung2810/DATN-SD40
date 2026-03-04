package com.example.datn.core.admin.banner.service;

import com.example.datn.core.admin.banner.model.request.ADBannerRequest;
import com.example.datn.core.admin.banner.model.request.ADBannerSearchRequest;
import com.example.datn.core.admin.banner.model.response.ADBannerResponse;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.infrastructure.constant.EntityStatus;

import java.util.List;

public interface ADBannerService {

    PageableObject<ADBannerResponse> search(ADBannerSearchRequest request);

    ADBannerResponse findById(String id);

    ADBannerResponse create(ADBannerRequest request);

    ADBannerResponse update(String id, ADBannerRequest request);

    void delete(String id);

    ADBannerResponse updateStatus(String id, EntityStatus status);

    List<ADBannerResponse> getActiveBanners(String slot);
}

