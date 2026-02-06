package com.example.datn.entity;


import com.example.datn.entity.base.PrimaryEntity;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@ToString
@Table(name = "handover_product_audit")
public class HandoverProductAudit extends PrimaryEntity implements Serializable {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "handover_id", nullable = false)
    private ShiftHandover shiftHandover;

    // Giả sử bạn đã có entity Product
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // Số lượng tồn kho theo hệ thống
    private int systemQuantity;

    // Số lượng thực tế nhân viên đếm
    private int actualQuantity;

    // Tình trạng (Quan trọng với máy ảnh: Trầy, xước, mốc rễ tre...)
    @Column(length = 500)
    private String conditionNote;
}
