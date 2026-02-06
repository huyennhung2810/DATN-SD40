package com.example.datn.entity;

import com.example.datn.entity.base.NameEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.io.Serializable;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@ToString
@Table(name = "shift_template")
//Quản lý khung giờ
public class ShiftTemplate extends NameEntity implements Serializable {

    @Column(nullable = false)
    private Long startTime;

    @Column(nullable = false)
    private Long endTime;

    @Column(columnDefinition = "boolean default true")
    private Boolean isActive;
}
