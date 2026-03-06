package com.example.datn.entity;

import com.example.datn.entity.base.NameEntity;
import com.example.datn.infrastructure.constant.EntityStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.io.Serializable;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Table(name = "storage_capacity")
public class StorageCapacity extends NameEntity implements Serializable {

    @Column(name = "code")
    private String code;

    @Column(name = "status")
    private EntityStatus status;
}
