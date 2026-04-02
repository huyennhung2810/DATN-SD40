package com.example.datn.entity;

import com.example.datn.entity.base.PrimaryEntity;
import com.example.datn.infrastructure.constant.SerialStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.DynamicUpdate;
import java.io.Serializable;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "serial")
@DynamicUpdate
public class Serial extends PrimaryEntity implements Serializable {

    @Column(name = "serial_number")
    private String serialNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "serial_status", length = 20)
    private SerialStatus serialStatus = SerialStatus.AVAILABLE;

    @ManyToOne
    @JoinColumn(name = "id_product_detail", referencedColumnName = "id")
    private ProductDetail productDetail;

    @ManyToOne
    @JoinColumn(name = "id_order_detail", referencedColumnName = "id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private OrderDetail orderDetail;

    @ManyToOne
    @JoinColumn(name = "id_order")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Order orderHolding;

    private Long lockedAt;

    public void setSoldAt(long l) {
    }

}
