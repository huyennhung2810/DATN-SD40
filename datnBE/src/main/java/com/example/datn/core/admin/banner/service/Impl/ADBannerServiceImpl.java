package com.example.datn.core.admin.banner.service.Impl;

import com.example.datn.core.admin.banner.model.request.ADBannerRequest;
import com.example.datn.core.admin.banner.model.request.ADBannerSearchRequest;
import com.example.datn.core.admin.banner.model.response.ADBannerResponse;
import com.example.datn.core.admin.banner.service.ADBannerService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.entity.Banner;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ADBannerServiceImpl implements ADBannerService {

    private final BannerRepository bannerRepository;

    @Override
    public PageableObject<ADBannerResponse> search(ADBannerSearchRequest request) {
        int page = request.getPage() > 0 ? request.getPage() - 1 : 0;
        PageRequest pageRequest = PageRequest.of(page, request.getSize());
        
        Page<Banner> pageData = bannerRepository.search(
                request.getKeyword(),
                request.getStatus(),
                request.getSlot(),
                pageRequest
        );

        return new PageableObject<>(pageData.map(this::toResponse));
    }

    @Override
    public ADBannerResponse findById(String id) {
        Banner entity = bannerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy banner"));
        return toResponse(entity);
    }

    @Override
    @Transactional
    public ADBannerResponse create(ADBannerRequest request) {
        Banner entity = new Banner();
        mapRequestToEntity(request, entity);
        entity.setStatus(request.getStatus() != null ? request.getStatus() : EntityStatus.ACTIVE);
        
        return toResponse(bannerRepository.save(entity));
    }

    @Override
    @Transactional
    public ADBannerResponse update(String id, ADBannerRequest request) {
        Banner entity = bannerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy banner"));

        mapRequestToEntity(request, entity);
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }

        return toResponse(bannerRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String id) {
        Banner entity = bannerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy banner"));
        bannerRepository.delete(entity);
    }

    @Override
    @Transactional
    public ADBannerResponse updateStatus(String id, EntityStatus status) {
        Banner entity = bannerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy banner"));
        
        entity.setStatus(status);
        return toResponse(bannerRepository.save(entity));
    }

    @Override
    public List<ADBannerResponse> getActiveBanners(String slot) {
        Long currentTime = System.currentTimeMillis();
        List<Banner> banners = bannerRepository.findActiveBanners(currentTime, slot);
        return banners.stream().map(this::toResponse).collect(Collectors.toList());
    }

    private void mapRequestToEntity(ADBannerRequest request, Banner entity) {
        entity.setTitle(request.getTitle());
        entity.setSlot(request.getSlot());
        entity.setImageUrl(request.getImageUrl());
        entity.setTargetUrl(request.getTargetUrl());
        entity.setAltText(request.getAltText());
        entity.setStartAt(request.getStartAt());
        entity.setEndAt(request.getEndAt());
        entity.setPriority(request.getPriority() != null ? request.getPriority() : 0);
        entity.setDescription(request.getDescription());
    }

    private ADBannerResponse toResponse(Banner entity) {
        ADBannerResponse response = new ADBannerResponse();
        response.setId(entity.getId());
        response.setCode(entity.getCode());
        response.setTitle(entity.getTitle());
        response.setSlot(entity.getSlot());
        response.setImageUrl(entity.getImageUrl());
        response.setTargetUrl(entity.getTargetUrl());
        response.setAltText(entity.getAltText());
        response.setStartAt(entity.getStartAt());
        response.setEndAt(entity.getEndAt());
        response.setPriority(entity.getPriority());
        response.setDescription(entity.getDescription());
        response.setStatus(entity.getStatus());
        response.setCreatedAt(entity.getCreatedDate());
        response.setUpdatedAt(entity.getLastModifiedDate());
        return response;
    }
}

