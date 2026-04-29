package com.example.datn.entity;

import com.example.datn.entity.base.PrimaryEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.Accessors;

import java.io.Serializable;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString(callSuper = true)
@Table(name = "tech_spec_definition_item")
@Accessors(chain = true)
public class TechSpecDefinitionItem extends PrimaryEntity implements Serializable {

    @Column(name = "name", length = 255, nullable = false)
    private String name;

    @Column(name = "value", length = 500)
    private String value;

    @Column(name = "display_order")
    private Integer displayOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tech_spec_definition")
    @ToString.Exclude
    private TechSpecDefinition techSpecDefinition;
}
