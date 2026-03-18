package com.example.datn.entity;


import com.example.datn.infrastructure.constant.EntityProperties;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "discount_detail")
public class DiscountDetail implements Serializable {
    @Id
    @Column(length = EntityProperties.LENGTH_ID, updatable = false)
    private String id;

    @Column(name = "code", unique = true, length = EntityProperties.LENGTH_CODE)
    private String code;

    @Column(name = "status")
    private Integer status;

    @Column(name = "price_before")
    private BigDecimal priceBefore;

    @Column(name = "price_after")
    private BigDecimal priceAfter;


    @Column(name = "created_at")
    private Long createdAt;


    @Column(name = "updated_at")
    private Long updatedAt;

    @ManyToOne
    @JoinColumn(name = "id_product_detail", referencedColumnName = "id")
    private ProductDetail productDetail;

    @ManyToOne
    @JoinColumn(name = "id_discount", referencedColumnName = "id")
    private Discount discount;
}


