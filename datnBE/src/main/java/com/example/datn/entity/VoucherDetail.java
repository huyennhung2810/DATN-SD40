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
@Table(name = "voucher_detail")
public class VoucherDetail extends PrimaryEntity implements Serializable {

    @Column(name = "usage_status")
    private String usageStatus;

    @Column(name = "note")
    private String note;

    @ManyToOne
    @JoinColumn(name = "id_voucher", referencedColumnName = "id")
    private Voucher voucher;

    @ManyToOne
    @JoinColumn(name = "id_customer", referencedColumnName = "id")
    private Customer customer;
}
