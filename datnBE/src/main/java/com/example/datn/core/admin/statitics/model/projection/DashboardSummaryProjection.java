package com.example.datn.core.admin.statitics.model.projection;

import java.math.BigDecimal;

public interface DashboardSummaryProjection {
    BigDecimal getTotalRevenue();
    Long getTotalOrders();
    Long getTotalItemsSold();

    Long getSuccessCount();
    Long getCanceledCount();
    Long getReturnedCount();
}
