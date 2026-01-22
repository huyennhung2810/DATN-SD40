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
@Table(name = "product_image")
public class ProductImage extends PrimaryEntity implements Serializable {

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(length = EntityProperties.LENGTH_URL)
    private String url;

    @ManyToOne
    @JoinColumn(name = "id_product", referencedColumnName = "id")
    private Product product;
}
