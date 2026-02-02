package com.example.datn.core.admin.statitics.service;

import com.example.datn.core.admin.statitics.model.projection.*;
import com.example.datn.core.admin.statitics.model.response.*;
import com.example.datn.core.admin.statitics.repository.ADStatisticsRepository;
import com.example.datn.infrastructure.constant.OrderStatus;
import com.example.datn.infrastructure.constant.TimeRangeType;
import com.example.datn.utils.TimeRange;
import com.example.datn.utils.TimeRangeUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ADStatisticsService {

    @Autowired
    private ADStatisticsRepository adStatisticsRepository;


    //Lấy dữ liệu dashboard và tỉ lệ tăng trưởng
    public RevenueDashboardResponse getDashboardSummary(TimeRangeType type) {
        //Lấy khoảng thời gian kỳ này và kỳ trước
        TimeRange current = TimeRangeUtils.getRange(type);
        TimeRange previous = TimeRangeUtils.getPreviousRange(type);

        //Truy vấn dữ liệu từ Repository
        DashboardSummaryProjection currData = adStatisticsRepository.getDashboardSummary(current.getStart(), current.getEnd());
        DashboardSummaryProjection prevData = adStatisticsRepository.getDashboardSummary(previous.getStart(), previous.getEnd());

        //Map vào response và tính toán tăng trưởng
        RevenueDashboardResponse res = new RevenueDashboardResponse();
        res.setPeriod(type.name());
        res.setTotalRevenue(currData.getTotalRevenue() != null ? currData.getTotalRevenue() : BigDecimal.ZERO);
        res.setTotalOrders(currData.getTotalOrders() != null ? currData.getTotalOrders().intValue() : 0);
        res.setTotalItemsSold(currData.getTotalItemsSold().intValue());

        //Chỉ số chi tiết trạng thái
        res.setSuccessCount(currData.getSuccessCount());
        res.setCanceledCount(currData.getCanceledCount());
        res.setReturnedCount(currData.getReturnedCount());

        //Tính toán % tăng trưởng
        res.setRevenueGrowthPercentage(calculateGrowth(currData.getTotalRevenue().doubleValue(), prevData.getTotalRevenue().doubleValue()));
        res.setOrderGrowthPercentage(calculateGrowth(currData.getTotalOrders().doubleValue(), prevData.getTotalOrders().doubleValue()));
        res.setProductGrowthPercentage(calculateGrowth(currData.getTotalItemsSold().doubleValue(), prevData.getTotalItemsSold().doubleValue()));

        return res;
    }

    //Dữ liệu biểu đồ tròn trạng thái đơn hàng
    public List<OrderStatusStatisticsResponse> getOrderStatusStats(TimeRangeType type) {
        TimeRange range = TimeRangeUtils.getRange(type);
        List<OrderStatusCountProjection> projections = adStatisticsRepository.countOrderByStatus(range.getStart(), range.getEnd());

        long total = projections.stream().mapToLong(OrderStatusCountProjection::getTotal).sum();

        return projections.stream().map(p -> {
            OrderStatusStatisticsResponse res = new OrderStatusStatisticsResponse();

            // Xử lý map Enum an toàn
            OrderStatus status = findOrderStatus(p.getStatus());

            res.setKey(status.name());
            res.setLabel(status.getLabel());
            res.setColor(status.getColor());
            res.setOrderCount(p.getTotal());
            res.setPercentage(total > 0 ? round((p.getTotal() * 100.0) / total) : 0.0);
            return res;
        }).collect(Collectors.toList());
    }

    private OrderStatus findOrderStatus(String statusName) {
        try {
            return OrderStatus.valueOf(statusName);
        } catch (Exception e) {
            return OrderStatus.UNKNOWN;
        }
    }

    //Danh sách sản phẩm bán chạy nhất
    public List<TopSellingProductResponse> getTopSellingProducts(TimeRangeType type) {
        TimeRange range = TimeRangeUtils.getRange(type);
        return getTopSellingProductsByCustomRange(range.getStart(), range.getEnd());
    }

    //Lấy Top sản phẩm bán chạy theo khoảng thời gian tùy chỉnh (Timestamp)
    public List<TopSellingProductResponse> getTopSellingProductsByCustomRange(Long start, Long end) {
        List<TopSellingProductProjection> projections = adStatisticsRepository.findTopSellingProducts(start, end);
        List<TopSellingProductResponse> list = new java.util.ArrayList<>();
        for (int i = 0; i < projections.size(); i++) {
            TopSellingProductResponse res = mapToTopSellingProductResponse(projections.get(i));
            res.setRank(i + 1);
            list.add(res);
        }
        return list;
    }

    private TopSellingProductResponse mapToTopSellingProductResponse(TopSellingProductProjection p) {
        TopSellingProductResponse res = new TopSellingProductResponse();
        res.setId(p.getProductId());
        res.setProductName(p.getProductName());
        res.setProductImage(p.getImageUrl());
        res.setQuantitySold(p.getQuantitySold());
        res.setRevenue(p.getRevenue());
        res.setSellingPrice(p.getSellingPrice());
        return res;
    }

    //Công thức tính tăng trưởng ((kỳ này - kỳ trước) / kỳ trước) * 100
    private Double calculateGrowth(Number current, Number previous) {
        double currVal = (current != null) ? current.doubleValue() : 0.0;
        double prevVal = (previous != null) ? previous.doubleValue() : 0.0;

        if (prevVal == 0) {
            return currVal > 0 ? 100.0 : 0.0;
        }
        return round(((currVal - prevVal) / prevVal) * 100);
    }

    private Double round(double value) {
        return BigDecimal.valueOf(value)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    // Thống kê số lượng đơn hàng hằng ngày cho biểu đồ đường (Line Chart)
    public List<OrderDailyResponse> getOrderCountByDate(TimeRangeType type) {
        TimeRange range = TimeRangeUtils.getRange(type);
        List<OrderDailyProjection> projections = adStatisticsRepository.getOrderCountByDate(range.getStart(), range.getEnd());

        //Chuyển list từ DB thành Map để tra cứu nhanh: Map<DateString, Total>
        Map<String, Long> dbDataMap = projections.stream()
                .collect(Collectors.toMap(OrderDailyProjection::getDate, OrderDailyProjection::getTotal));

        // Tạo danh sách tất cả các ngày trong khoảng range
        List<OrderDailyResponse> fullList = new java.util.ArrayList<>();
        LocalDate startDoc = Instant.ofEpochMilli(range.getStart()).atZone(ZoneId.systemDefault()).toLocalDate();
        LocalDate endDoc = Instant.ofEpochMilli(range.getEnd()).atZone(ZoneId.systemDefault()).toLocalDate();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        for (LocalDate date = startDoc; !date.isAfter(endDoc); date = date.plusDays(1)) {
            String dateStr = date.format(formatter);
            OrderDailyResponse res = new OrderDailyResponse();
            res.setDate(dateStr);
            // Nếu DB không có dữ liệu cho ngày này, mặc định là 0
            res.setTotal(dbDataMap.getOrDefault(dateStr, 0L));
            fullList.add(res);
        }

        return fullList;
    }

    public List<EmployeeSaleResponse> getEmployeeSalesStats(TimeRangeType type) {
        TimeRange range = TimeRangeUtils.getRange(type);
        List<EmployeeSalesProjection> projections = adStatisticsRepository.getEmployeeSalesStats(range.getStart(), range.getEnd());

        return projections.stream().map(p -> {
            EmployeeSaleResponse res = new EmployeeSaleResponse();
            res.setEmployeeId(p.getEmployeeId());
            res.setEmployeeCode(p.getEmployeeCode());
            res.setEmployeeName(p.getEmployeeName());
            res.setTotalOrders(p.getTotalOrders());
            res.setTotalRevenue(p.getTotalRevenue() != null ? p.getTotalRevenue() : BigDecimal.ZERO);
            return res;
        }).collect(Collectors.toList());
    }
}
