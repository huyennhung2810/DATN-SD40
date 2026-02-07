package com.example.datn.entity;

import com.example.datn.entity.base.NameEntity;
import com.example.datn.entity.base.PrimaryEntity;
import com.example.datn.infrastructure.constant.EntityProperties;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

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

    @Column(name = "price", precision = 15, scale = 2)
    private java.math.BigDecimal price;

    @ManyToOne
    @JoinColumn(name = "id_tech_spec", referencedColumnName = "id")
    private TechSpec techSpec;

    @ManyToOne
    @JoinColumn(name = "id_product_category", referencedColumnName = "id")
    private ProductCategory productCategory;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductImage> images = new ArrayList<>();

}
