package com.example.datn.core.admin.statitics.service;

import com.example.datn.core.admin.statitics.model.projection.*;
import com.example.datn.core.admin.statitics.model.response.*;
import com.example.datn.core.admin.statitics.repository.ADStatisticsRepository;
import com.example.datn.infrastructure.constant.OrderStatus;
import com.example.datn.infrastructure.constant.TimeRangeType;
import com.example.datn.utils.TimeRange;
import com.example.datn.utils.TimeRangeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ADStatisticsService {

    @Autowired
    private ADStatisticsRepository adStatisticsRepository;


    //Tính % tăng trưởng: ((Mới - Cũ) / Cũ) * 100
    private Double calculateGrowth(double current, double previous) {
        if (previous == 0) {
            // Nếu kỳ trước = 0, kỳ này > 0 thì tăng 100%, ngược lại là 0%
            return current > 0 ? 100.0 : 0.0;
        }
        double growth = ((current - previous) / previous) * 100;
        return round(growth);
    }
    //Tính tỉ lệ phần trăm
    private Double calculateRate(long part, long total) {
        if (total == 0) return 0.0;
        return round((double) part / total * 100);
    }

    private Double getDouble(Number val) {
        return val == null ? 0.0 : val.doubleValue();
    }

    //Làm tròn 1 chữ số thập phân
    private Double round(double value) {
        return BigDecimal.valueOf(value).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    //Chuyển localDatetime sang milliseconds
    private long toMillis(LocalDateTime localDateTime) {
        if (localDateTime == null) return 0L;
        return localDateTime.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
    }

    //Lấy dữ liệu dashboard và tỉ lệ tăng trưởng
    public ADDashboardResponse getAdminDashboardOverview() {
        LocalDateTime now = LocalDateTime.now();
        long currentTime = toMillis(now);

        // 1. TÍNH TOÁN CÁC MỐC THỜI GIAN
        LocalDate today = now.toLocalDate();

        long startOfDay = toMillis(today.atStartOfDay());
        long startOfWeek = toMillis(today.with(DayOfWeek.MONDAY).atStartOfDay());
        long startOfMonth = toMillis(today.with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay());
        long startOfYear = toMillis(today.with(TemporalAdjusters.firstDayOfYear()).atStartOfDay());

        // Tháng trước (Dùng để tính % tăng trưởng)
        LocalDateTime lastMonthStart = today.minusMonths(1).with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();
        LocalDateTime lastMonthEnd = today.minusMonths(1).with(TemporalAdjusters.lastDayOfMonth()).atTime(LocalTime.MAX);
        long startOfLastMonth = toMillis(lastMonthStart);
        long endOfLastMonth = toMillis(lastMonthEnd);

        // 2. TRUY VẤN DATABASE
        DashboardSummaryProjection todayStat = adStatisticsRepository.getDashboardSummary(startOfDay, currentTime);
        DashboardSummaryProjection weekStat = adStatisticsRepository.getDashboardSummary(startOfWeek, currentTime);
        DashboardSummaryProjection monthStat = adStatisticsRepository.getDashboardSummary(startOfMonth, currentTime);
        DashboardSummaryProjection yearStat = adStatisticsRepository.getDashboardSummary(startOfYear, currentTime);
        DashboardSummaryProjection lastMonthStat = adStatisticsRepository.getDashboardSummary(startOfLastMonth, endOfLastMonth);

        List<OrderStatusCountProjection> statusCounts = adStatisticsRepository.countOrderByStatus(startOfMonth, currentTime);
        List<TopSellingProductProjection> topSellingProjections = adStatisticsRepository.findTopSellingProducts(startOfMonth, currentTime);

        // 3. XỬ LÝ DỮ LIỆU & TÍNH TOÁN

        // A. Map trạng thái đơn hàng (Sửa lỗi khai báo trùng lặp ở đây)
        Map<String, Long> statusMap = statusCounts.stream()
                .collect(Collectors.toMap(
                        p -> p.getStatus().toString(),
                        OrderStatusCountProjection::getTotal,
                        (existing, replacement) -> existing
                ));

        // - Chờ xử lý: PENDING
        long pending = statusMap.getOrDefault(OrderStatus.PENDING.name(), 0L);

        // - Đang xử lý: CONFIRMED + PACKAGING + SHIPPING
        long processing = statusMap.getOrDefault(OrderStatus.CONFIRMED.name(), 0L)
                + statusMap.getOrDefault(OrderStatus.PACKAGING.name(), 0L)
                + statusMap.getOrDefault(OrderStatus.SHIPPING.name(), 0L);

        // - Hoàn thành: COMPLETED
        long completed = statusMap.getOrDefault(OrderStatus.COMPLETED.name(), 0L);

        // - Đã hủy/Thất bại: CANCELED + DELIVERY_FAILED
        long canceled = statusMap.getOrDefault(OrderStatus.CANCELED.name(), 0L)
                + statusMap.getOrDefault(OrderStatus.DELIVERY_FAILED.name(), 0L);

        // B. Tính toán tăng trưởng Doanh thu
        double currentMonthRevenue = getDouble(monthStat.getTotalRevenue());
        double lastMonthRevenue = getDouble(lastMonthStat.getTotalRevenue());
        double growth = calculateGrowth(currentMonthRevenue, lastMonthRevenue);

        // C. Tính tỷ lệ hoàn thành
        long totalOrdersMonth = monthStat.getTotalOrders() != null ? monthStat.getTotalOrders() : 0L;
        double completionRate = calculateRate(completed, totalOrdersMonth);

        // D. Map Top sản phẩm
        List<ADDashboardResponse.TopProductDto> topProducts = topSellingProjections.stream()
                .limit(5)
                .map(p -> ADDashboardResponse.TopProductDto.builder()
                        .name(p.getProductName())
                        .soldCount(p.getQuantitySold())
                        .revenue(p.getRevenue())
                        .imageUrl(p.getImageUrl())
                        .build())
                .collect(Collectors.toList());

        // 4. BUILD RESPONSE
        return ADDashboardResponse.builder()
                // Doanh thu
                .revenueToday(getDouble(todayStat.getTotalRevenue()))
                .revenueThisWeek(getDouble(weekStat.getTotalRevenue()))
                .revenueThisMonth(currentMonthRevenue)
                .revenueThisYear(getDouble(yearStat.getTotalRevenue()))
                .growthPercentage(growth)

                // Đơn hàng
                .totalOrders(totalOrdersMonth)
                .completionRate(completionRate)
                .pendingCount(pending)
                .processingCount(processing)
                .completedCount(completed)
                .cancelledCount(canceled)

                // Sản phẩm
                .totalProducts(adStatisticsRepository.countTotalProductDetails())
                .lowStockCount(adStatisticsRepository.countLowStockProducts())
                .topSellingProducts(topProducts)

                // Khách hàng
                .totalCustomers(adStatisticsRepository.countTotalCustomers())
                .newCustomersThisMonth(adStatisticsRepository.countNewCustomers(startOfMonth, currentTime))
                .build();
    }

}
