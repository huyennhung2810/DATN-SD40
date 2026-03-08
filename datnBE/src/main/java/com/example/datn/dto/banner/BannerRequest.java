package com.example.datn.dto.banner;

import com.example.datn.infrastructure.constant.BannerPosition;
import com.example.datn.infrastructure.constant.BannerType;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.LinkTarget;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BannerRequest {

    private String id;

    private String code;

    @NotBlank(message = "Tiêu đề banner không được để trống")
    private String title;

    private String subtitle;

    private String description;

    @NotBlank(message = "Ảnh banner không được để trống")
    private String imageUrl;

    private String mobileImageUrl;

    private String linkUrl;

    @Builder.Default
    private LinkTarget linkTarget = LinkTarget.SAME_TAB;

    @NotNull(message = "Vị trí banner không được để trống")
    private BannerPosition position;

    @Builder.Default
    private BannerType type = BannerType.IMAGE;

    @Builder.Default
    private EntityStatus status = EntityStatus.ACTIVE;

    @Builder.Default
    private Integer priority = 0;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    private String buttonText;

    private String backgroundColor;
}
