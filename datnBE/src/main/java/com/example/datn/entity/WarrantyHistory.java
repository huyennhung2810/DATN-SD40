package com.example.datn.entity;

import com.example.datn.entity.base.PrimaryEntity;
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
@Table(name = "warranty_history")
public class WarrantyHistory extends PrimaryEntity implements Serializable {

    @Column(name = "warranty_date")
    private Long warrantyDate;

    @Column(name = "error_description")
    private String errorDescription;

    @Column(name = "repair_method")
    private String repairMethod;

    @Column(name = "total_cost")
    private BigDecimal totalCost;

    @Column(name = "note")
    private String note;

    @ManyToOne
    @JoinColumn(name = "id_warranty", referencedColumnName = "id")
    private Warranty warranty;


}
