package com.example.datn.entity;


import com.example.datn.entity.base.PrimaryEntity;
import com.example.datn.infrastructure.constant.OrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "order_history")
public class OrderHistory extends PrimaryEntity implements Serializable {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_order", referencedColumnName = "id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Order order;

    // Quan hệ N-1 với bảng Order (Hóa đơn)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_hoa_don", referencedColumnName = "id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Order hoaDon;

    // Enum trạng thái hóa đơn
    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false)
    private OrderStatus trangThai;

    // Thời gian cập nhật trạng thái
    @Column(name = "thoi_gian")
    private LocalDateTime thoiGian;

    // Ghi chú (note) cho lần thay đổi trạng thái này
    @Column(name = "ghi_chu", columnDefinition = "NVARCHAR(500)")
    private String note;

    // Quan hệ N-1 với bảng Employee (Nhân viên thao tác)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_nhan_vien", referencedColumnName = "id")
    private Employee nhanVien;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_khach_hang", referencedColumnName = "id")
    private Customer khachHang;

}
