package com.example.datn.entity;

import com.example.datn.entity.base.PrimaryEntity;
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

    @ManyToOne
    @JoinColumn(name = "id_product_detail", referencedColumnName = "id")
    private ProductDetail productDetail;

}
