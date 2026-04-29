package com.example.datn.entity;


import com.example.datn.entity.base.PrimaryEntity;
import com.example.datn.infrastructure.constant.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "payment_history")
public class PaymentHistory extends PrimaryEntity implements Serializable {

    // Liên kết với bảng Order (Hóa đơn)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_order", referencedColumnName = "id")
    private Order order;

    // Liên kết với bảng Employee (Nhân viên thực hiện giao dịch)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_employee", referencedColumnName = "id")
    private Employee employee;

    // Số tiền giao dịch (Nên dùng BigDecimal cho tiền tệ để tránh sai số)
    @Column(name = "amount", precision = 15, scale = 2)
    private BigDecimal amount;

    // Loại giao dịch (VD: "THANH_TOAN", "HOAN_TIEN")
    @Column(name = "transaction_type", length = 50)
    private String transactionType;

    //Thời gian giao dịch
    @Column(name = "thoi_gian")
    private LocalDateTime thoiGian;

    // Mã giao dịch (VD: "PAY-123456", "REFUND-123456")
    @Column(name = "transaction_code", length = 100)
    private String transactionCode;

    // Ghi chú giao dịch
    @Column(name = "note", columnDefinition = "NVARCHAR(500)")
    private String note;

    @Column(name = "payment_status")
    private PaymentStatus trangThaiThanhToan;
}
