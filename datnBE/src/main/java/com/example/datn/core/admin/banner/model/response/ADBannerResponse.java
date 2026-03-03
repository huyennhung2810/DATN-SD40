package com.example.datn.core.admin.banner.model.response;

import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ADBannerResponse {

    private String id;

    private String code;

    private String title;

    private String imageUrl;

    private String linkUrl;

    private String position;

    private Integer priority;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    private EntityStatus status;

    private Long createdDate;

    private Long lastModifiedDate;
}

