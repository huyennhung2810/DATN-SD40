package com.example.datn.entity;

import com.example.datn.entity.base.PrimaryEntity;
import com.example.datn.infrastructure.constant.ChangeRequestStatus;
import com.example.datn.infrastructure.constant.ChangeRequestType;
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
@Table(name = "order_change_request")
public class OrderChangeRequest extends PrimaryEntity implements Serializable {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_order", nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    private ChangeRequestType type;

    @Column(name = "old_value", length = 500)
    private String oldValue;

    @Column(name = "new_value", nullable = false, length = 500)
    private String newValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "change_status", nullable = false, length = 50)
    private ChangeRequestStatus changeStatus = ChangeRequestStatus.CHO_XU_LY;

    @Column(name = "admin_note", columnDefinition = "NVARCHAR(500)")
    private String adminNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_employee")
    private Employee handledBy;

    @Column(name = "handled_at")
    private Long handledAt;
}
