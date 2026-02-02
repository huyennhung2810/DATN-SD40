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
@Table(name = "discount_detail")
public class DiscountDetail extends PrimaryEntity implements Serializable {

    @Column(name = "price_before")
    private BigDecimal priceBefore;

    @Column(name = "price_after")
    private BigDecimal priceAfter;

    @Column(name = "note")
    private String note;

    @ManyToOne
    @JoinColumn(name = "id_product_detail", referencedColumnName = "id")
    private ProductDetail productDetail;

    @ManyToOne
    @JoinColumn(name = "id_discount", referencedColumnName = "id")
    private Discount discount;
}


