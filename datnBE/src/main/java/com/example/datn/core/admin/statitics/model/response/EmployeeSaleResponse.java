package com.example.datn.core.admin.statitics.model.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeSaleResponse {
    private String employeeId;
    private String employeeName;
    private String employeeCode;
    private Long totalOrders; // tog hóa đơn đã chốt
    private BigDecimal totalRevenue;  //Tổng tiền mang về

    
}
