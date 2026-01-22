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
@Table(name = "cart")
public class Cart extends PrimaryEntity implements Serializable {

    @Column(name = "note")
    private String note;

    @ManyToOne
    @JoinColumn(name = "id_customer", referencedColumnName = "id")
    private Customer customer;
}
