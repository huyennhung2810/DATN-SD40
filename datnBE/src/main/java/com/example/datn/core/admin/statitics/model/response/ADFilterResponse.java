package com.example.datn.core.admin.statitics.model.response;

import java.math.BigDecimal;

public interface ADFilterResponse {
    BigDecimal getTotalRevenue();
    Long getTotalOrders();
    Long getTotalProductsSold();
}
