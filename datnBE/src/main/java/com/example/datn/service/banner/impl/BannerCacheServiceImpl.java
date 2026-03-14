package com.example.datn.service.banner.impl;

import com.example.datn.entity.Banner;
import com.example.datn.infrastructure.constant.BannerPosition;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.repository.BannerRepository;
import com.example.datn.service.banner.BannerCacheService;
import com.example.datn.service.banner.dto.BannerMapper;
import com.example.datn.service.banner.dto.BannerResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerCacheServiceImpl implements BannerCacheService {

    private final BannerRepository bannerRepository;
    private final BannerMapper bannerMapper;

    @Override
    @Cacheable(value = "banners", key = "#position.name()")
    public List<BannerResponse> getCachedBannersByPosition(BannerPosition position) {
        LocalDateTime now = LocalDateTime.now();
        List<Banner> banners = bannerRepository.findActiveBannersByPosition(
                EntityStatus.ACTIVE,
                position,
                now
        );
        return bannerMapper.toResponseList(banners);
    }

    @Override
    @Cacheable(value = "allActiveBanners")
    public List<BannerResponse> getCachedAllActiveBanners() {
        LocalDateTime now = LocalDateTime.now();
        List<Banner> banners = bannerRepository.findAllActiveBanners(EntityStatus.ACTIVE, now);
        return bannerMapper.toResponseList(banners);
    }

    @Override
    @CacheEvict(value = {"banners", "allActiveBanners"}, allEntries = true)
    public void clearCache() {
    }
}
