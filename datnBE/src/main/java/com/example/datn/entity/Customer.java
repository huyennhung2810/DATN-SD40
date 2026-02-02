package com.example.datn.entity;

import com.example.datn.entity.base.NameEntity;
import com.example.datn.entity.base.PrimaryEntity;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "customer")
@Builder
public class Customer extends NameEntity implements Serializable {

    @Column(name = "identityCard")
    private String identityCard; //Mã định danh (CCCD/CMND)

    @Column(name = "email")
    private String email;

    @Column(name = "gender")
    private Boolean gender;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "date_of_birth")
    private Long dateOfBirth;

    @Column(name = "image")
    private String image;

    @ManyToOne
    @JoinColumn(name = "id_account", referencedColumnName = "id")
    private Account account;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Address> addresses = new ArrayList<>();

}
