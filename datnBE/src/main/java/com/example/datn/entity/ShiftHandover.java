package com.example.datn.entity;


import com.example.datn.entity.base.PrimaryEntity;
import com.example.datn.infrastructure.constant.HandoverStatus;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@ToString
@Table(name = "shift_handover")
//Phiếu giao ca
public class ShiftHandover extends PrimaryEntity implements Serializable {

    @OneToOne
    @JoinColumn(name = "schedule_id", nullable = false, unique = true)
    private WorkSchedule workSchedule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "successor_id")
    private Employee successor;

    private Long checkInTime;
    private Long checkOutTime;

    //Tiền mặt có sẵn trong két lúc nhận ca
    @Column(precision = 15, scale = 2)
    private BigDecimal initialCash;

    // Tổng tiền thu được trong ca (Hệ thống tính từ Order)
    @Column(precision = 15, scale = 2)
    private BigDecimal totalCashSales;

    // Tiền nhân viên rút ra chi tiêu (trả ship, tiền điện...)
    @Column(precision = 15, scale = 2)
    private BigDecimal cashWithdraw;

    // Tiền mặt thực tế đếm được cuối ca
    @Column(precision = 15, scale = 2)
    private BigDecimal actualCashAtEnd;

    // Số tiền lệch (= actual - (initial + sales - withdraw))
    @Column(precision = 15, scale = 2)
    private BigDecimal differenceAmount;

    // Lý do lệch (Bắt buộc nếu differenceAmount != 0)
    @Column
    private String differenceReason;

    // Ghi chú chung
    @Lob
    @Column(name = "note")
    private String note;

    @Enumerated(EnumType.STRING)
    private HandoverStatus handoverStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account;

}

