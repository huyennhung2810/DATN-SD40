package com.example.datn.core.admin.order.model.request;

import com.example.datn.infrastructure.constant.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class ADChangeStatusRequest {
    private String maHoaDon; // Chính là Order ID
    private OrderStatus statusTrangThaiHoaDon;
    private String note;
    private String idNhanVien;
}
