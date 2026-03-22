package com.example.datn.core.admin.order.model.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ADUpdateCustomerRequest {

    private String maHoaDon;
    private String tenKhachHang;
    private String sdtKH;
    private String email;
    private String diaChi;
}
