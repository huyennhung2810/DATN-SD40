package com.example.datn.entity;

import com.example.datn.entity.base.PrimaryEntity;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "product_detail")
public class ProductDetail extends PrimaryEntity implements Serializable {

    @Column(name = "version")
    private String version;

    @Column(name = "sale_price")
    private BigDecimal salePrice;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "note")
    private String note;

    @ManyToOne
    @JoinColumn(name = "id_product", referencedColumnName = "id")
    private Product product;

    @ManyToOne
    @JoinColumn(name = "id_color", referencedColumnName = "id")
    private Color color;

    @ManyToOne
    @JoinColumn(name = "id_storage_capacity", referencedColumnName = "id")
    private StorageCapacity storageCapacity;
}
