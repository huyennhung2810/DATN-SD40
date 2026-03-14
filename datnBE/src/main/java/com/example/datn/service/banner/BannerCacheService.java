package com.example.datn.service.banner;

import com.example.datn.infrastructure.constant.BannerPosition;
import com.example.datn.service.banner.dto.BannerResponse;

import java.util.List;

public interface BannerCacheService {

    List<BannerResponse> getCachedBannersByPosition(BannerPosition position);

    List<BannerResponse> getCachedAllActiveBanners();

    void clearCache();
}
