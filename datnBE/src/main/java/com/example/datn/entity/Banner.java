package com.example.datn.entity;

import com.example.datn.entity.base.PrimaryEntity;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "banner")
public class Banner extends PrimaryEntity implements Serializable {

    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "slot", length = 50)
    private String slot;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "target_url", length = 500)
    private String targetUrl;

    @Column(name = "alt_text", length = 255)
    private String altText;

    @Column(name = "start_at")
    private Long startAt;

    @Column(name = "end_at")
    private Long endAt;

    @Column(name = "priority")
    private Integer priority = 0;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}

