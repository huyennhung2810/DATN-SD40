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
@Table(name = "tech_spec_definition")
public class TechSpecDefinition extends PrimaryEntity implements Serializable {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tech_spec_group")
    @ToString.Exclude
    private TechSpecGroup techSpecGroup;

    @Column(name = "name", length = EntityProperties.LENGTH_NAME)
    private String name;

    @Column(name = "description", length = EntityProperties.LENGTH_DESCRIPTION)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "data_type", length = 20)
    private DataType dataType;

    @Column(name = "unit", length = 50)
    private String unit;

    @Column(name = "is_filterable")
    private Boolean isFilterable = false;

    @Column(name = "is_required")
    private Boolean isRequired = false;

    @Column(name = "display_order")
    private Integer displayOrder;

    public enum DataType {
        TEXT,
        NUMBER,
        BOOLEAN,
        ENUM,
        RANGE
    }
}
