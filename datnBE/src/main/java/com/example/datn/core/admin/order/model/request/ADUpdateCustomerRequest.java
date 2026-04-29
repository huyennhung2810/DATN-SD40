package com.example.datn.core.admin.order.model.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ADUpdateCustomerRequest {

    private String maHoaDon;

    // Chọn địa chỉ có sẵn của khách
    private String addressId;

    // Hoặc nhập địa chỉ mới
    private String diaChi;          // địa chỉ đầy đủ (đã ghép)
    private String diaChiChiTiet;   // số nhà, đường
    private String tinhThanhPho;
    private String quanHuyen;
    private String phuongXa;
    private String sdtNguoiNhan;
    private String tenNguoiNhan;
}
