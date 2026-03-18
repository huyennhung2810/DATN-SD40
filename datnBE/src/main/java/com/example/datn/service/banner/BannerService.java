package com.example.datn.service.banner;

import com.example.datn.infrastructure.constant.BannerPosition;
import com.example.datn.service.banner.dto.BannerRequest;
import com.example.datn.service.banner.dto.BannerResponse;
import com.example.datn.service.banner.dto.BannerSearchRequest;
import org.springframework.data.domain.Page;

import java.util.List;

public interface BannerService {

    BannerResponse create(BannerRequest request);

    BannerResponse update(String id, BannerRequest request);

    void delete(String id);

    BannerResponse findById(String id);

    Page<BannerResponse> search(BannerSearchRequest request);

    List<BannerResponse> getBannersByPosition(BannerPosition position);

    List<BannerResponse> getAllActiveBanners();

    void updateStatus(String id, Integer status);
}
