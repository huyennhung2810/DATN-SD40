package com.example.datn.core.admin.statitics.model.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RevenueDashboardResponse {

    //Today, week, month, year, custom
    private String period;

    //Tổng doanh thu
    private BigDecimal totalRevenue;

    //Tổng số đơn đặt hàng
    private Integer totalOrders;

    //Tổng số hàng đã bán
    private Integer totalItemsSold;

    //Phần trăm tăng trưởng doanh thu
    private Double revenueGrowthPercentage;

    //Phần trăm tăng trưởng hóa đơn
    private Double orderGrowthPercentage;

    // Phần trăm tăng trưởng sản phẩm
    private Double productGrowthPercentage;

    //Số đơn hàng thành công
    private Long successCount;

    //Số đơn hàng đã hủy
    private Long canceledCount;

    //Số lượng trả hàng
    private Long returnedCount;
}
