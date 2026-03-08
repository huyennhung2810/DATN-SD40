package com.example.datn.dto.banner;

import com.example.datn.infrastructure.constant.BannerPosition;
import com.example.datn.infrastructure.constant.BannerType;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.LinkTarget;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BannerResponse {

    private String id;

    private String code;

    private String title;

    private String subtitle;

    private String description;

    private String imageUrl;

    private String mobileImageUrl;

    private String linkUrl;

    private LinkTarget linkTarget;

    private BannerPosition position;

    private BannerType type;

    private EntityStatus status;

    private Integer priority;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    private String buttonText;

    private String backgroundColor;

    private Long createdDate;

    private Long lastModifiedDate;
}
