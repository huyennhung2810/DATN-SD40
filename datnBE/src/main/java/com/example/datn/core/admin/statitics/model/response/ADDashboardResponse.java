package com.example.datn.core.admin.statitics.model.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ADDashboardResponse {
    //Doanh thu
    private Double revenueToday;
    private Double revenueThisWeek;
    private Double revenueThisMonth;
    private Double revenueThisYear;
    private Double growthPercentage; // % Tăng trưởng so với tháng trước

    //Đơn hàng
    private Long totalOrders;     // Tổng đơn (lấy theo tháng hoặc tổng toàn bộ tùy logic)
    private Double completionRate; // Tỷ lệ hoàn thành
    private Long pendingCount;    // Chờ xác nhận
    private Long processingCount; // Đang xử lý
    private Long completedCount;  // Hoàn thành
    private Long cancelledCount;  // Đã hủy

    //Sản phẩm
    private Long totalProducts;
    private Long lowStockCount;
    private List<TopProductDto> topSellingProducts;

    //Khách hàng
    private Long totalCustomers;
    private Long newCustomersThisMonth;

    @Data
    @Builder
    public static class TopProductDto {
        private String id;
        private String name;
        private Long soldCount;
        private String version;
        private BigDecimal revenue;
        private String imageUrl;
        private String category;
        private BigDecimal price;
    }
}
