package com.example.datn.entity;

import com.example.datn.entity.base.NameEntity;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "employee")
public class Employee extends NameEntity implements Serializable {

    @Column(name = "identity_card")
    private String identityCard;

    @Column(name = "date_of_birth")
    private Long dateOfBirth;

    @Column(name = "gender")
    private Boolean gender;

    @Column(name = "hometown")
    private String hometown;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "email")
    private String email;

     @Column(name = "employee_image")
    private String employeeImage;

    @Column(name = "province_city")
    private String provinceCity;

    @Column(name = "ward_commune")
    private String wardCommune;

    @Column(name = "province_code")
    private Integer provinceCode;


    @Column(name = "ward_code")
    private Integer wardCode;

    @OneToOne
    @JoinColumn(name = "id_account", referencedColumnName = "id")
    private Account account;
}
