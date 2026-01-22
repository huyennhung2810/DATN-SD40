package com.example.datn.entity;
import com.example.datn.infrastructure.constant.EntityProperties;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.listener.CreatePrimaryEntityListener;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@ToString
@Builder
@Table(name = "address")
public class Address implements Serializable {

    @Id
    @Column(length = EntityProperties.LENGTH_ID, updatable = false)
    private String id;

    @PrePersist
    protected void onCreate() {
        this.id = UUID.randomUUID().toString();
    }

    @Column(name = "name")
    private String name;

    @Column(name = "phone_number", length = 15)
    private String phoneNumber;

    //Tỉnh - thành phố
    @Column(name = "province_city")
    private String provinceCity;


    //Xã - phường - thị trấn
    @Column(name = "ward_commune")
    private String wardCommune;

    @Column(name = "province_code")
    private Integer provinceCode;


    @Column(name = "ward_code")
    private Integer wardCode;

    //Địa chỉ cụ thể
    @Column(name = "address_detail")
    private String addressDetail;

    //Địa chỉ mặc định để giao hàng
    @Column(name = "is_default")
    private Boolean isDefault;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_customer", referencedColumnName = "id")
    @JsonBackReference
    @ToString.Exclude
    private Customer customer;

    @Column(name = "status")
    @Enumerated(EnumType.ORDINAL)
    private EntityStatus status;
}
