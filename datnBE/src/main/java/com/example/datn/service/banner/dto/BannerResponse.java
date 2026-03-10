package com.example.datn.service.banner.dto;

import com.example.datn.infrastructure.constant.BannerPosition;
import com.example.datn.infrastructure.constant.BannerType;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.LinkTarget;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BannerResponse {

    private String id;

    private String code;

    private EntityStatus status;

    private String title;

    private String subtitle;

    private String description;

    private String imageUrl;

    private String mobileImageUrl;

    private String linkUrl;

    private LinkTarget linkTarget;

    private BannerPosition position;

    private BannerType type;

    private Integer priority;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    private String buttonText;

    private String backgroundColor;

    private Long createdDate;

    private Long lastModifiedDate;
}
