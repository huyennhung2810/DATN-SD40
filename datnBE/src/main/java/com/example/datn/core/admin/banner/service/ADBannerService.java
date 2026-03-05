package com.example.datn.core.admin.banner.service;

import com.example.datn.core.admin.banner.model.request.ADBannerRequest;
import com.example.datn.core.admin.banner.model.request.ADBannerSearchRequest;
import com.example.datn.core.admin.banner.model.response.ADBannerResponse;
import com.example.datn.core.common.base.PageableObject;
import java.util.List;

public interface ADBannerService {

    PageableObject<ADBannerResponse> search(ADBannerSearchRequest request);

    ADBannerResponse create(ADBannerRequest request);

    ADBannerResponse update(String id, ADBannerRequest request);

    void delete(String id);

    ADBannerResponse findById(String id);

    List<ADBannerResponse> findActiveBanners(String position);
}

