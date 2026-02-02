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
@Table(name = "warranty")
public class Warranty extends PrimaryEntity implements Serializable {

    @Column(name = "start_date")
    private Long startDate;

    @Column(name = "end_date")
    private Long endDate;

    @Column(name = "note")
    private String note;

    @ManyToOne
    @JoinColumn(name = "id_order_detail", referencedColumnName = "id")
    private OrderDetail orderDetail;
}
