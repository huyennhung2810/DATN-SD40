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
@Table(name = "cart_detail")
public class CartDetail extends PrimaryEntity implements Serializable {

    @ManyToOne
    @JoinColumn(name = "id_cart", referencedColumnName = "id")
    private Cart cart;

    @ManyToOne
    @JoinColumn(name = "id_product_detail", referencedColumnName = "id")
    private ProductDetail productDetail;
}
