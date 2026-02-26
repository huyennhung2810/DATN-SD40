package com.example.datn.core.admin.banner.model.request;

import com.example.datn.infrastructure.constant.EntityStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ADBannerRequest {

    private String id;

    @NotBlank(message = "Tiêu đề banner không được để trống")
    private String title;

    @NotBlank(message = "Vị trí banner không được để trống")
    private String slot;

    private String imageUrl;

    private String targetUrl;

    private String altText;

    private Long startAt;

    private Long endAt;

    private Integer priority = 0;

    private String description;

    private EntityStatus status;
}

