package com.example.datn.entity;

import com.example.datn.entity.base.NameEntity;
import com.example.datn.entity.base.PrimaryEntity;
import com.example.datn.infrastructure.constant.EntityProperties;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@ToString
@Table(name = "voucher")
public class Voucher implements Serializable {
    @Id
    @Column(length = EntityProperties.LENGTH_ID, updatable = false)
    private String id;

    @Column(name = "code", unique = true, length = EntityProperties.LENGTH_CODE)
    private String code;

    @Column(name = "name", length = EntityProperties.LENGTH_NAME)
    private String name;

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

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "last_modified_by")
    private String lastModifiedBy;

    @Column(name = "Last_modified_date")
    private Long LastModifiedDate;

    @Column(name = "discount_value")
    private BigDecimal discountValue;

    @Column(name = "status")
    private Integer status;

    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("voucher") // ✅ Bỏ tham chiếu ngược
    private List<VoucherDetail> details;
}
