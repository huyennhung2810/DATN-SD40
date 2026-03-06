package com.example.datn.entity;

import com.example.datn.entity.base.PrimaryEntity;
import com.example.datn.infrastructure.constant.EntityProperties;
import com.example.datn.infrastructure.constant.EntityStatus;
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

    @Column(name = "title", length = EntityProperties.LENGTH_NAME)
    private String title;

    @Column(name = "image_url", length = 500, nullable = false)
    private String imageUrl;

    @Column(name = "link_url", length = 500)
    private String linkUrl;

    @Column(name = "position", length = 50)
    private String position;

    @Column(name = "priority")
    private Integer priority;

    @Column(name = "start_at")
    private LocalDateTime startAt;

    @Column(name = "end_at")
    private LocalDateTime endAt;

    @Enumerated(EnumType.ORDINAL)
    @Column(name = "status")
    private EntityStatus status;
}
