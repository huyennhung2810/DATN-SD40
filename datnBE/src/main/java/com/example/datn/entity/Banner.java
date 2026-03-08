package com.example.datn.entity;

import com.example.datn.entity.base.PrimaryEntity;
import com.example.datn.infrastructure.constant.EntityProperties;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.BannerPosition;
import com.example.datn.infrastructure.constant.BannerType;
import com.example.datn.infrastructure.constant.LinkTarget;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "banner")
public class Banner extends PrimaryEntity {

    @Column(name = "code", length = EntityProperties.LENGTH_NAME)
    private String code;

    @Column(name = "title", length = EntityProperties.LENGTH_NAME, nullable = false)
    private String title;

    @Column(name = "subtitle", length = 255)
    private String subtitle;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "image_url", length = 500, nullable = false)
    private String imageUrl;

    @Column(name = "mobile_image_url", length = 500)
    private String mobileImageUrl;

    @Column(name = "link_url", length = 500)
    private String linkUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "link_target", length = 20)
    private LinkTarget linkTarget = LinkTarget.SAME_TAB;

    @Enumerated(EnumType.STRING)
    @Column(name = "position", length = 30, nullable = false)
    private BannerPosition position;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 20)
    private BannerType type = BannerType.IMAGE;

    @Enumerated(EnumType.ORDINAL)
    @Column(name = "status", nullable = false)
    private EntityStatus status = EntityStatus.ACTIVE;

    @Column(name = "priority")
    private Integer priority = 0;

    @Column(name = "start_at")
    private LocalDateTime startAt;

    @Column(name = "end_at")
    private LocalDateTime endAt;

    @Column(name = "button_text", length = 100)
    private String buttonText;

    @Column(name = "background_color", length = 20)
    private String backgroundColor;
}
