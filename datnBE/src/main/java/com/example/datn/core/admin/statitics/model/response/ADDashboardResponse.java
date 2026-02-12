package com.example.datn.core.admin.statitics.model.response;

import java.math.BigDecimal;
import java.math.RoundingMode;

public interface ADDashboardResponse {

    //Hôm nay
    BigDecimal getRevenueToday();
    Long getOrdersToday();
    Long getProductsSoldToday();

    //Tuần này
    BigDecimal getRevenueThisWeek();
    Long getOrdersThisWeek();
    Long getProductsSoldThisWeek();

    //Tháng này
    BigDecimal getRevenueThisMonth();
    Long getOrdersThisMonth();
    Long getProductsSoldThisMonth();

    //Năm nay
    BigDecimal getRevenueThisYear();
    Long getOrdersThisYear();
    Long getProductsSoldThisYear();


    // Danh thu tháng trước
    BigDecimal getRevenueLastMonth();

    //Tính %L
    default Double getGrowthPercentage() {
        BigDecimal thisMonth = getRevenueThisMonth() != null ? getRevenueThisMonth() : BigDecimal.ZERO;
        BigDecimal lastMonth = getRevenueLastMonth() != null ? getRevenueLastMonth() : BigDecimal.ZERO;

        // Nếu tháng trước = 0
        if (lastMonth.compareTo(BigDecimal.ZERO) == 0) {
            // Tháng này có doanh thu -> Tăng trưởng 100%, ngược lại 0%
            return thisMonth.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }

        // Công thức: ((Tháng này - Tháng trước) / Tháng trước) * 100
        return thisMonth.subtract(lastMonth)
                .divide(lastMonth, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }
}