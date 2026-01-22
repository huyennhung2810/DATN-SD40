package com.example.datn.entity;

import com.example.datn.entity.base.NameEntity;
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
@Table(name = "product")
public class Product extends NameEntity implements Serializable {

    @Column(length = EntityProperties.LENGTH_DESCRIPTION)
    private String description;

    @ManyToOne
    @JoinColumn(name = "id_tech_spec", referencedColumnName = "id")
    private TechSpec techSpec;

    @ManyToOne
    @JoinColumn(name = "id_product_category", referencedColumnName = "id")
    private ProductCategory productCategory;
}
