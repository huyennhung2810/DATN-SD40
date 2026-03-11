package com.example.datn.service.banner.dto;

import com.example.datn.infrastructure.constant.BannerPosition;
import com.example.datn.infrastructure.constant.BannerType;
import com.example.datn.infrastructure.constant.LinkTarget;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BannerRequest {

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    private String subtitle;

    private String description;

    @NotBlank(message = "Ảnh desktop không được để trống")
    private String imageUrl;

    private String mobileImageUrl;

    private String linkUrl;

    private LinkTarget linkTarget = LinkTarget.SAME_TAB;

    @NotNull(message = "Vị trí không được để trống")
    private BannerPosition position;

    private BannerType type = BannerType.IMAGE;

    private Integer priority = 0;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    private String buttonText;

    private String backgroundColor;
}
