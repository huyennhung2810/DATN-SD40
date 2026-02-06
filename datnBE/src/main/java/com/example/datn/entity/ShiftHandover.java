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
    @JoinColumn(name = "employee_id")
    private Employee employee;

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
    @Column(columnDefinition = "TEXT")
    private String differenceReason;

    // Ghi chú chung
    @Column(columnDefinition = "TEXT")
    private String note;

    @Enumerated(EnumType.STRING)
    private HandoverStatus status;

    // Danh sách kiểm kê máy ảnh
    @OneToMany(mappedBy = "shiftHandover", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HandoverProductAudit> productAudits;

}

