package com.example.datn.core.admin.statitics.controller;

import com.example.datn.core.admin.statitics.model.response.*;
import com.example.datn.core.admin.statitics.service.ADStatisticsService;
import com.example.datn.infrastructure.constant.MappingConstants;
import com.example.datn.infrastructure.constant.TimeRangeType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(MappingConstants.API_ADMIN_PREFIX_STATISTICS)
@RequiredArgsConstructor
@Slf4j
public class ADStatisticsController {

    private final ADStatisticsService adStatisticsService;

    @GetMapping("/summary")
    public ResponseEntity<RevenueDashboardResponse> getSummary(
            @RequestParam(name = "type", defaultValue = "MONTH") TimeRangeType type) {
        return ResponseEntity.ok(adStatisticsService.getDashboardSummary(type));
    }

    @GetMapping("/order-status")
    public ResponseEntity<List<OrderStatusStatisticsResponse>> getOrderStatusStats(
            @RequestParam(name = "type", defaultValue = "MONTH") TimeRangeType type) {
        return ResponseEntity.ok(adStatisticsService.getOrderStatusStats(type));
    }

    @GetMapping("/top-selling")
    public ResponseEntity<List<TopSellingProductResponse>> getTopSelling(
            @RequestParam(name = "type", defaultValue = "MONTH") TimeRangeType type) {
        return ResponseEntity.ok(adStatisticsService.getTopSellingProducts(type));
    }

    @GetMapping("/custom-range")
    public ResponseEntity<List<TopSellingProductResponse>> getTopSellingByRange(
            @RequestParam Long startDate,
            @RequestParam Long endDate) {
        return ResponseEntity.ok(adStatisticsService.getTopSellingProductsByCustomRange(startDate, endDate));
    }

    @GetMapping("/daily-orders")
    public ResponseEntity<List<OrderDailyResponse>> getDailyOrders(
            @RequestParam(name = "type", defaultValue = "MONTH") TimeRangeType type) {
        return ResponseEntity.ok(adStatisticsService.getOrderCountByDate(type));
    }

    @GetMapping("/employee-sales")
    public ResponseEntity<List<EmployeeSaleResponse>> getEmployeeSales(
            @RequestParam(name = "type", defaultValue = "MONTH") TimeRangeType type) {
        log.info("Fetching employee sales statistics for period: {}", type);
        return ResponseEntity.ok(adStatisticsService.getEmployeeSalesStats(type));
    }

}
