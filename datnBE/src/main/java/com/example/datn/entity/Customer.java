package com.example.datn.entity;

import com.example.datn.entity.base.NameEntity;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.math.BigDecimal;
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

    // Thêm precision và scale cho chuẩn tiền tệ
    @Column(name = "totalSpent", precision = 15, scale = 2)
    private BigDecimal totalSpent = BigDecimal.ZERO;

    @ManyToOne
    @JoinColumn(name = "id_account", referencedColumnName = "id")
    private Account account;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    @ToString.Exclude
    @Builder.Default
    private List<Address> addresses = new ArrayList<>();

}
