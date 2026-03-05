package com.example.datn.core.admin.banner.model.request;

import com.example.datn.infrastructure.constant.EntityStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ADBannerRequest {

    private String id;

    private String code;

    private String title;

    @NotBlank(message = "Image URL is required")
    private String imageUrl;

    private String linkUrl;

    private String position;

    private Integer priority;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    private EntityStatus status;
}

