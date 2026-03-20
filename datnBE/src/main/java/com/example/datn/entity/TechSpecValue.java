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
@Table(name = "tech_spec_value")
public class TechSpecValue extends PrimaryEntity implements Serializable {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_product")
    @ToString.Exclude
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tech_spec_definition")
    @ToString.Exclude
    private TechSpecDefinition techSpecDefinition;

    @Column(name = "value_text", length = 500)
    private String valueText;

    @Column(name = "value_number")
    private Double valueNumber;

    @Column(name = "value_boolean")
    private Boolean valueBoolean;

    @Column(name = "value_min")
    private Double valueMin;

    @Column(name = "value_max")
    private Double valueMax;

    @Column(name = "display_value", length = 500)
    private String displayValue;
}
