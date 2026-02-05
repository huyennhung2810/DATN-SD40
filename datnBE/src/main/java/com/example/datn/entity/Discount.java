package com.example.datn.entity;

import com.example.datn.entity.base.NameEntity;
import com.example.datn.entity.base.PrimaryEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "discount")
public class Discount extends NameEntity implements Serializable {

    @Column(name = "discount_percent")
    private BigDecimal discountPercent;

    @Column(name = "start_date")
    private Long startDate;

    @Column(name = "end_date")
    private Long endDate;

    @Column(name = "note")
    private String note;

    @Column(name = "quantity")
    private Integer quantity;
}
