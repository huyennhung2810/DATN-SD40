package com.example.datn.entity;

import com.example.datn.entity.base.PrimaryEntity;
import com.example.datn.infrastructure.constant.EntityProperties;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "tech_spec_group")
public class TechSpecGroup extends PrimaryEntity implements Serializable {

    @Column(name = "name", length = EntityProperties.LENGTH_NAME)
    private String name;

    @Column(name = "description", length = EntityProperties.LENGTH_DESCRIPTION)
    private String description;

    @Column(name = "display_order")
    private Integer displayOrder;
}
