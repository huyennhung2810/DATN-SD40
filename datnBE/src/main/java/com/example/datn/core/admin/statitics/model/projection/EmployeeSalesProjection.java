package com.example.datn.core.admin.statitics.model.projection;

import java.math.BigDecimal;

public interface EmployeeSalesProjection {
    String getEmployeeId();
    String getEmployeeName();
    String getEmployeeCode();
    Long getTotalOrders();
    BigDecimal getTotalRevenue();
}
