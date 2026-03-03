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
@Table(name = "lens_mount")
public class LensMount extends PrimaryEntity implements Serializable {

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;
}

