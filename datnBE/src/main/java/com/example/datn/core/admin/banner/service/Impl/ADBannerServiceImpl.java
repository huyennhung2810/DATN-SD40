package com.example.datn.core.admin.banner.service.Impl;

import com.example.datn.core.admin.banner.model.request.ADBannerRequest;
import com.example.datn.core.admin.banner.model.request.ADBannerSearchRequest;
import com.example.datn.core.admin.banner.model.response.ADBannerResponse;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.entity.Banner;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ADBannerServiceImpl implements com.example.datn.core.admin.banner.service.ADBannerService {

    private final BannerRepository bannerRepository;

    @Override
    public PageableObject<ADBannerResponse> search(ADBannerSearchRequest request) {
        // Simple search - return all banners with pagination
        Page<Banner> page = bannerRepository.findAll(Pageable.ofSize(request.getSize()).withPage(request.getPage()));
        List<ADBannerResponse> content = page.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return new PageableObject<>(content, page.getTotalPages(), page.getTotalElements(), page.getSize(), page.getNumber());
    }

    @Override
    @Transactional
    public ADBannerResponse create(ADBannerRequest request) {
        Banner banner = new Banner();
        toEntity(banner, request);
        banner.setStatus(EntityStatus.ACTIVE);
        banner.setPriority(request.getPriority() != null ? request.getPriority() : 0);
        banner.setPosition(request.getPosition() != null ? request.getPosition() : "HOME_TOP");
        Banner saved = bannerRepository.save(banner);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public ADBannerResponse update(String id, ADBannerRequest request) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));
        toEntity(banner, request);
        Banner saved = bannerRepository.save(banner);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(String id) {
        bannerRepository.deleteById(id);
    }

    @Override
    public ADBannerResponse findById(String id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));
        return toResponse(banner);
    }

    @Override
    public List<ADBannerResponse> findActiveBanners(String position) {
        List<Banner> banners;
        if (position != null && !position.isEmpty()) {
            banners = bannerRepository.findActiveBanners(EntityStatus.ACTIVE, position, LocalDateTime.now());
        } else {
            banners = bannerRepository.findAllActiveBanners(EntityStatus.ACTIVE, LocalDateTime.now());
        }
        return banners.stream().map(this::toResponse).collect(Collectors.toList());
    }

    private void toEntity(Banner banner, ADBannerRequest request) {
        banner.setTitle(request.getTitle());
        banner.setImageUrl(request.getImageUrl());
        banner.setLinkUrl(request.getLinkUrl());
        banner.setPosition(request.getPosition());
        banner.setPriority(request.getPriority());
        banner.setStartAt(request.getStartAt());
        banner.setEndAt(request.getEndAt());
        if (request.getStatus() != null) {
            banner.setStatus(request.getStatus());
        }
    }

    private ADBannerResponse toResponse(Banner banner) {
        ADBannerResponse response = new ADBannerResponse();
        response.setId(banner.getId());
        response.setCode(banner.getCode());
        response.setTitle(banner.getTitle());
        response.setImageUrl(banner.getImageUrl());
        response.setLinkUrl(banner.getLinkUrl());
        response.setPosition(banner.getPosition());
        response.setPriority(banner.getPriority());
        response.setStartAt(banner.getStartAt());
        response.setEndAt(banner.getEndAt());
        response.setStatus(banner.getStatus());
        response.setCreatedDate(banner.getCreatedDate());
        response.setLastModifiedDate(banner.getLastModifiedDate());
        return response;
    }
}

