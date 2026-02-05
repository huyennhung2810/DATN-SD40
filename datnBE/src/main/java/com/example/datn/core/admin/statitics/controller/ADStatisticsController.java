package com.example.datn.core.admin.statitics.controller;

import com.example.datn.core.admin.statitics.model.response.*;
import com.example.datn.core.admin.statitics.service.ADStatisticsService;
import com.example.datn.infrastructure.constant.MappingConstants;
import com.example.datn.infrastructure.constant.TimeRangeType;
import com.example.datn.utils.TimeRange;
import com.example.datn.utils.TimeRangeUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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

    // dashbroad
    @GetMapping("/overview")
    public ResponseEntity<ADDashboardResponse> getOverview() {
        return ResponseEntity.ok(adStatisticsService.getDashboardOverview());
    }

    //Tốc độ tăng trưởng
    @GetMapping("/growth")
    public ResponseEntity<List<ADGrowthStatResponse>> getStoreGrowth() {
        return ResponseEntity.ok(adStatisticsService.getStoreGrowth());
    }

    // Filtered
    @GetMapping("/filtered")
    public ResponseEntity<ADFilterResponse> getFilteredStats(
            @RequestParam(defaultValue = "THIS_MONTH") TimeRangeType type,
            @RequestParam(required = false) Long startDate,
            @RequestParam(required = false) Long endDate
    ) {
        return ResponseEntity.ok(adStatisticsService.getFilteredStats(type, startDate, endDate));
    }

    // Biểu đồ doanh thu
    @GetMapping("/revenue")
    public ResponseEntity<List<ADRevenueStatResponse>> getRevenueStats(
            @RequestParam(defaultValue = "THIS_MONTH") TimeRangeType type,
            @RequestParam(required = false) Long startDate,
            @RequestParam(required = false) Long endDate
    ) {
        return ResponseEntity.ok(adStatisticsService.getRevenueStats(type, startDate, endDate));
    }

    //Biểu đồ tròn
    @GetMapping("/order-status")
    public ResponseEntity<List<ADOrderStatusStatResponse>> getOrderStatusStats(
            @RequestParam(defaultValue = "THIS_MONTH") TimeRangeType type,
            @RequestParam(required = false) Long startDate,
            @RequestParam(required = false) Long endDate
    ) {
        return ResponseEntity.ok(adStatisticsService.getOrderStatusStats(type, startDate, endDate));
    }

    //Top sản phẩm bán chạy
    @GetMapping("/top-selling")
    public ResponseEntity<List<ADTopSellingProductsResponse>> getTopSelling(
            @RequestParam(defaultValue = "THIS_MONTH") TimeRangeType type,
            @RequestParam(required = false) Long startDate,
            @RequestParam(required = false) Long endDate
    ) {
        return ResponseEntity.ok(adStatisticsService.getTopSellingProducts(type, startDate, endDate));
    }

    //Sản phẩm sắp hết hàng
    @GetMapping("/low-stock")
    public ResponseEntity<List<ADLowstockProductResponse>> getLowStockProducts() {
        return ResponseEntity.ok(adStatisticsService.getLowStockProducts());
    }


    //Xuất excel
    @GetMapping("/export-all")
    public ResponseEntity<byte[]> exportAllStatistics(
            @RequestParam(required = false) Long startDate,
            @RequestParam(required = false) Long endDate
    ) {
        if (startDate == null || endDate == null) {
            TimeRange range = TimeRangeUtils.getRange(TimeRangeType.THIS_MONTH);
            startDate = range.getStart();
            endDate = range.getEnd();
        }

        byte[] excelContent = adStatisticsService.exportAllStatistics(startDate, endDate);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bao_cao_tong_hop.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelContent);
    }
}