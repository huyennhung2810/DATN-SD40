package com.example.datn.entity;

import com.example.datn.infrastructure.constant.EntityProperties;
import jakarta.persistence.*;
import lombok.*;
import net.minidev.json.annotate.JsonIgnore;

import java.io.Serializable;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "voucher_detail")
public class VoucherDetail implements Serializable {

    @Id
    @Column(length = EntityProperties.LENGTH_ID, updatable = false)
    private String id;

    @Column(name = "usage_status")
    private Integer usageStatus;

    @Column(name = "used_date")
    private Long usedDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_order", referencedColumnName = "id")
    private Order order;

    @Column(name = "created_date")
    private Long created_date;

    @ManyToOne
    @JoinColumn(name = "id_voucher", referencedColumnName = "id")
    @JsonIgnore
    private Voucher voucher;

    @ManyToOne
    @JoinColumn(name = "id_customer", referencedColumnName = "id")
    private Customer customer;

    @Column(name = "reason", length = 255)
    private String reason; // Lưu lý do vô hiệu hóa hoặc ghi chú đặc biệt

    @Column(name = "is_notified")
    private Integer isNotified;

}
