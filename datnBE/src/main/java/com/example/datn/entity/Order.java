package com.example.datn.entity;

import com.example.datn.entity.base.PrimaryEntity;
import com.example.datn.infrastructure.constant.EntityProperties;
import com.example.datn.infrastructure.constant.OrderStatus;
import com.example.datn.infrastructure.constant.TypeInvoice;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "order")
public class Order extends PrimaryEntity implements Serializable {

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type")
    private TypeInvoice orderType;

    @Column(name = "shipping_fee")
    private BigDecimal shippingFee;

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    @Column(name = "total_after_discount")
    private BigDecimal totalAfterDiscount;

    @Column(name = "recipient_name", length = EntityProperties.LENGTH_NAME)
    private String recipientName;

    @Column(name = "recipient_address")
    private String recipientAddress;

    @Column(name = "recipient_phone")
    private String recipientPhone;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "payment_date")
    private Long paymentDate;

    @Column(name = "note")
    private String note;

    @ManyToOne
    @JoinColumn(name = "id_customer", referencedColumnName = "id")
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status")
    private OrderStatus orderStatus;

    @ManyToOne
    @JoinColumn(name = "id_employee", referencedColumnName = "id")
    private Employee employee;

    @ManyToOne
    @JoinColumn(name = "id_shipping_method", referencedColumnName = "id")
    private ShippingMethods shippingMethod;

    @ManyToOne
    @JoinColumn(name = "id_voucher", referencedColumnName = "id")
    private Voucher voucher;
}
