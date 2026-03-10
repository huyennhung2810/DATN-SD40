package com.example.datn.service.banner.dto;

import com.example.datn.entity.Banner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class BannerMapper {

    public Banner toEntity(BannerRequest request) {
        if (request == null) {
            return null;
        }
        Banner banner = new Banner();
        banner.setTitle(request.getTitle());
        banner.setSubtitle(request.getSubtitle());
        banner.setDescription(request.getDescription());
        banner.setImageUrl(request.getImageUrl());
        banner.setMobileImageUrl(request.getMobileImageUrl());
        banner.setLinkUrl(request.getLinkUrl());
        banner.setLinkTarget(request.getLinkTarget());
        banner.setPosition(request.getPosition());
        banner.setType(request.getType());
        banner.setPriority(request.getPriority());
        banner.setStartAt(request.getStartAt());
        banner.setEndAt(request.getEndAt());
        banner.setButtonText(request.getButtonText());
        banner.setBackgroundColor(request.getBackgroundColor());
        return banner;
    }

    public void updateEntity(Banner banner, BannerRequest request) {
        if (request == null || banner == null) {
            return;
        }
        banner.setTitle(request.getTitle());
        banner.setSubtitle(request.getSubtitle());
        banner.setDescription(request.getDescription());
        banner.setImageUrl(request.getImageUrl());
        banner.setMobileImageUrl(request.getMobileImageUrl());
        banner.setLinkUrl(request.getLinkUrl());
        banner.setLinkTarget(request.getLinkTarget());
        banner.setPosition(request.getPosition());
        banner.setType(request.getType());
        banner.setPriority(request.getPriority());
        banner.setStartAt(request.getStartAt());
        banner.setEndAt(request.getEndAt());
        banner.setButtonText(request.getButtonText());
        banner.setBackgroundColor(request.getBackgroundColor());
    }

    public BannerResponse toResponse(Banner banner) {
        if (banner == null) {
            return null;
        }
        return BannerResponse.builder()
                .id(banner.getId())
                .code(banner.getCode())
                .status(banner.getStatus())
                .title(banner.getTitle())
                .subtitle(banner.getSubtitle())
                .description(banner.getDescription())
                .imageUrl(banner.getImageUrl())
                .mobileImageUrl(banner.getMobileImageUrl())
                .linkUrl(banner.getLinkUrl())
                .linkTarget(banner.getLinkTarget())
                .position(banner.getPosition())
                .type(banner.getType())
                .priority(banner.getPriority())
                .startAt(banner.getStartAt())
                .endAt(banner.getEndAt())
                .buttonText(banner.getButtonText())
                .backgroundColor(banner.getBackgroundColor())
                .createdDate(banner.getCreatedDate())
                .lastModifiedDate(banner.getLastModifiedDate())
                .build();
    }

    public List<BannerResponse> toResponseList(List<Banner> banners) {
        if (banners == null) {
            return null;
        }
        return banners.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}
