package com.example.datn.entity;

import com.example.datn.entity.base.NameEntity;
import com.example.datn.entity.base.PrimaryEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@ToString
@Table(name = "voucher")
public class Voucher extends NameEntity implements Serializable {

    @Column(name = "voucher_type")
    private String voucherType;

    @Column(name = "discount_unit")
    private String discountUnit; // %, VND

    @Column(name = "max_discount_amount")
    private BigDecimal maxDiscountAmount;

    @Column(name = "conditions")
    private BigDecimal conditions; // Giá trị đơn hàng tối thiểu để áp dụng

    @Column(name = "start_date")
    private Long startDate;

    @Column(name = "end_date")
    private Long endDate;

    @Column(name = "note")
    private String note;
}
