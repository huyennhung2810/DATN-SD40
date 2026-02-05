package com.example.datn.core.admin.discountDetail.model.request;

import lombok.Data;

import java.util.List;
@Data
public class ADDiscountDetailRequest {
    private String idDiscount;
    private List<String> idProductDetails; // Danh sách ID sản phẩm được áp dụng
    private String note;
}
