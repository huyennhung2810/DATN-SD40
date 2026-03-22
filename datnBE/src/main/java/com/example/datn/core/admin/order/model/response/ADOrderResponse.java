package com.example.datn.core.admin.order.model.response;

import com.example.datn.infrastructure.constant.OrderStatus;
import com.example.datn.infrastructure.constant.TypeInvoice;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class ADOrderResponse {
    private String id;
    private String maHoaDon;
    private String tenKhachHang;
    private String sdtKhachHang;
    private String maNhanVien;
    private String tenNhanVien;
    private BigDecimal tongTien;
    private TypeInvoice loaiHoaDon;
    private Long createdDate;
    private OrderStatus status;
}
