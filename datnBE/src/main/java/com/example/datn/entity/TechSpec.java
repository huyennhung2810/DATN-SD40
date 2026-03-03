package com.example.datn.entity;

import com.example.datn.entity.base.PrimaryEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import java.io.Serializable;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "tech_spec")
public class TechSpec extends PrimaryEntity implements Serializable {

    @Column(name = "sensor_type")
    private String sensorType;

    @Column(name = "lens_mount")
    private String lensMount;

    @Column(name = "resolution")
    private String resolution;

    @Column(name = "iso")
    private String iso;

    @Column(name = "processor")
    private String processor;

    @Column(name = "image_format")
    private String imageFormat;

    @Column(name = "video_format")
    private String videoFormat;

    // Xóa createdAt và updatedAt vì PrimaryEntity đã có
}