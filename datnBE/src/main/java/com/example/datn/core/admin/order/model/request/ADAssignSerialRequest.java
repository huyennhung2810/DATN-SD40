package com.example.datn.core.admin.order.model.request;


import lombok.Data;

@Data
public class ADAssignSerialRequest {

    private String hoaDonChiTietId;
    private String oldImeiId;
    private String newImeiId;
}
