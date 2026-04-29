package com.example.datn.entity;

import com.example.datn.entity.base.PrimaryEntity;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "shipping_audit_log")
public class ShippingAuditLog extends PrimaryEntity implements Serializable {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_order", nullable = false)
    private Order order;

    @Column(name = "field_name", nullable = false, length = 100)
    private String fieldName;

    @Column(name = "old_value", columnDefinition = "NVARCHAR(500)")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "NVARCHAR(500)")
    private String newValue;

    @Column(name = "change_type", nullable = false, length = 50)
    private String changeType;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "is_direct_update")
    private Boolean isDirectUpdate;
}
