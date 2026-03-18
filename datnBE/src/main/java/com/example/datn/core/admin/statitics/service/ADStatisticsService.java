package com.example.datn.core.admin.statitics.service;

import com.example.datn.core.admin.statitics.model.response.*;
import com.example.datn.core.admin.statitics.repository.ADStatisticsRepository;
import com.example.datn.infrastructure.constant.TimeRangeType;
import com.example.datn.utils.TimeRange;
import com.example.datn.utils.TimeRangeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class ADStatisticsService {

    private final ADStatisticsRepository adStatisticsRepository;

    //Logic thời gian dùng chung
    private TimeRange resolveTimeRange(TimeRangeType type, Long customStart, Long customEnd) {
        if (type == TimeRangeType.CUSTOM) {
            if (customStart == null || customEnd == null) {
                return TimeRangeUtils.getRange(TimeRangeType.THIS_MONTH);
            }
            return new TimeRange(customStart, customEnd);
        }
        return TimeRangeUtils.getRange(type);
    }


    public ADDashboardResponse getDashboardOverview() {
        return adStatisticsRepository.getStatOverview();
    }

    public ADFilterResponse getFilteredStats(TimeRangeType type, Long customStart, Long customEnd) {
        TimeRange range = resolveTimeRange(type, customStart, customEnd);
        return adStatisticsRepository.getFilteredStats(range.getStart(), range.getEnd());
    }

    public List<ADTopSellingProductsResponse> getTopSellingProducts(TimeRangeType type, Long customStart, Long customEnd) {
        TimeRange range = resolveTimeRange(type, customStart, customEnd);
        return adStatisticsRepository.getTopSellingProducts(range.getStart(), range.getEnd());
    }

    //Biểu đồ tròn
    public List<ADOrderStatusStatResponse> getOrderStatusStats(TimeRangeType type, Long customStart, Long customEnd) {
        TimeRange range = resolveTimeRange(type, customStart, customEnd);
        return adStatisticsRepository.getOrderStatusStats(range.getStart(), range.getEnd());
    }

    //Biểu đồ doanh thu
    public List<ADRevenueStatResponse> getRevenueStats(TimeRangeType type, Long customStart, Long customEnd) {
        TimeRange queryRange = resolveTimeRange(type, customStart, customEnd);

        String sqlDateFormat;
        if (type == TimeRangeType.TODAY) {
            sqlDateFormat = "%H:00";
        } else if (type == TimeRangeType.THIS_YEAR) {
            sqlDateFormat = "%Y-%m";
        } else {
            sqlDateFormat = "%Y-%m-%d";
        }

        List<ADRevenueStatResponse> rawData = adStatisticsRepository.getRevenueStats(
                queryRange.getStart(),
                queryRange.getEnd(),
                sqlDateFormat
        );

        Map<String, BigDecimal> dataMap = rawData.stream()
                .collect(Collectors.toMap(
                        ADRevenueStatResponse::getDate,
                        item -> item.getRevenue() == null ? BigDecimal.ZERO : item.getRevenue(),
                        (v1, v2) -> v1
                ));

        List<ADRevenueStatResponse> fullData = new ArrayList<>();
        LocalDate today = LocalDate.now();


        if (type == TimeRangeType.TODAY) {
            for (int hour = 0; hour < 24; hour++) {
                String timeKey = String.format("%02d:00", hour);
                fullData.add(new ADRevenueStatDTO(timeKey, dataMap.getOrDefault(timeKey, BigDecimal.ZERO)));
            }
        }


        else if (type == TimeRangeType.THIS_WEEK) {
            // Lấy ngày thứ 2 của tuần này
            LocalDate startOfWeek = today.with(DayOfWeek.MONDAY);
            // Lấy ngày Chủ nhật của tuần này
            LocalDate endOfWeek = today.with(DayOfWeek.SUNDAY);

            LocalDate current = startOfWeek;
            while (!current.isAfter(endOfWeek)) {
                String dateKey = current.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                fullData.add(new ADRevenueStatDTO(dateKey, dataMap.getOrDefault(dateKey, BigDecimal.ZERO)));
                current = current.plusDays(1);
            }
        }

        else if (type == TimeRangeType.THIS_MONTH) {
            // Ngày đầu tháng
            LocalDate startOfMonth = today.with(TemporalAdjusters.firstDayOfMonth());
            // Ngày cuối tháng
            LocalDate endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth());

            LocalDate current = startOfMonth;
            while (!current.isAfter(endOfMonth)) {
                String dateKey = current.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                fullData.add(new ADRevenueStatDTO(dateKey, dataMap.getOrDefault(dateKey, BigDecimal.ZERO)));
                current = current.plusDays(1);
            }
        }

        else if (type == TimeRangeType.THIS_YEAR) {
            int currentYear = today.getYear();
            for (int month = 1; month <= 12; month++) {
                String monthKey = String.format("%d-%02d", currentYear, month);
                fullData.add(new ADRevenueStatDTO(monthKey, dataMap.getOrDefault(monthKey, BigDecimal.ZERO)));
            }
        }

        else {
            LocalDate start = Instant.ofEpochMilli(queryRange.getStart()).atZone(ZoneId.systemDefault()).toLocalDate();
            LocalDate end = Instant.ofEpochMilli(queryRange.getEnd()).atZone(ZoneId.systemDefault()).toLocalDate();

            LocalDate current = start;
            while (!current.isAfter(end)) {
                String dateKey = current.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                fullData.add(new ADRevenueStatDTO(dateKey, dataMap.getOrDefault(dateKey, BigDecimal.ZERO)));
                current = current.plusDays(1);
            }
        }

        return fullData;
    }


    //Sản phẩm sắp hết hàng
    public List<ADLowstockProductResponse> getLowStockProducts() {
        return adStatisticsRepository.getLowStockProducts();
    }

    private Double calculateGrowth(BigDecimal current, BigDecimal previous) {
        if (previous.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }


    //Tốc độ tăng trưởng
    public List<ADGrowthStatResponse> getStoreGrowth() {
        List<ADGrowthStatResponse> list = new ArrayList<>();

        TimeRangeType[] types = {TimeRangeType.TODAY, TimeRangeType.THIS_WEEK, TimeRangeType.THIS_MONTH, TimeRangeType.THIS_YEAR};
        String[] labels = {"ngày", "Tuần", "Tháng", "năm"};

        for (int i = 0; i < types.length; i++) {
            TimeRange currentRange = TimeRangeUtils.getRange(types[i]);
            TimeRange prevRange = TimeRangeUtils.getPreviousRange(types[i]);

            BigDecimal currRev = adStatisticsRepository.sumRevenue(currentRange.getStart(), currentRange.getEnd());
            BigDecimal prevRev = adStatisticsRepository.sumRevenue(prevRange.getStart(), prevRange.getEnd());

            list.add(new ADGrowthStatResponse("Doanh thu " + labels[i], currRev, calculateGrowth(currRev, prevRev), true));
        }

        for (int i = 0; i < types.length; i++) {
            TimeRange currentRange = TimeRangeUtils.getRange(types[i]);
            TimeRange prevRange = TimeRangeUtils.getPreviousRange(types[i]);

            BigDecimal currOrd = BigDecimal.valueOf(adStatisticsRepository.countOrders(currentRange.getStart(), currentRange.getEnd()));
            BigDecimal prevOrd = BigDecimal.valueOf(adStatisticsRepository.countOrders(prevRange.getStart(), prevRange.getEnd()));

            list.add(new ADGrowthStatResponse("Đơn hàng " + labels[i], currOrd, calculateGrowth(currOrd, prevOrd), false));
        }

        for (int i = 0; i < types.length; i++) {
            TimeRange currentRange = TimeRangeUtils.getRange(types[i]);
            TimeRange prevRange = TimeRangeUtils.getPreviousRange(types[i]);

            BigDecimal currProd = BigDecimal.valueOf(adStatisticsRepository.sumSoldProducts(currentRange.getStart(), currentRange.getEnd()));
            BigDecimal prevProd = BigDecimal.valueOf(adStatisticsRepository.sumSoldProducts(prevRange.getStart(), prevRange.getEnd()));

            list.add(new ADGrowthStatResponse("Sản phẩm " + labels[i], currProd, calculateGrowth(currProd, prevProd), false));
        }

        return list;
    }


    //Xuất excel
    public byte[] exportAllStatistics(Long startDate, Long endDate) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            createDashboardSheet(workbook);

            createGrowthSheet(workbook);

            createRevenueSheet(workbook, startDate, endDate);

            createOrderStatusSheet(workbook, startDate, endDate);

            createTopSellingSheet(workbook, startDate, endDate);

            createLowStockSheet(workbook);

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi tạo file Excel: " + e.getMessage());
        }
    }

    private void createRevenueSheet(Workbook workbook, Long startDate, Long endDate) {
        Sheet sheet = workbook.createSheet("Doanh thu");
        List<ADRevenueStatResponse> data = adStatisticsRepository.getRevenueStats(startDate, endDate, "%Y-%m-%d");

        // Header
        Row headerRow = sheet.createRow(0);
        String[] headers = {"STT", "Ngày", "Doanh Thu"};
        createHeader(workbook, headerRow, headers);

        // Data
        int rowIdx = 1;
        AtomicInteger index = new AtomicInteger(1);
        for (ADRevenueStatResponse item : data) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(index.getAndIncrement());
            row.createCell(1).setCellValue(item.getDate());
            row.createCell(2).setCellValue(item.getRevenue() != null ? item.getRevenue().doubleValue() : 0);
        }
        autoSizeColumns(sheet, headers.length);
    }

    private void createTopSellingSheet(Workbook workbook, Long startDate, Long endDate) {
        Sheet sheet = workbook.createSheet("Top Bán Chạy");
        List<ADTopSellingProductsResponse> data = adStatisticsRepository.getTopSellingProducts(startDate, endDate);

        // Header
        Row headerRow = sheet.createRow(0);
        String[] headers = {"STT", "Tên Sản Phẩm", "Giá Bán", "Đã Bán"};
        createHeader(workbook, headerRow, headers);

        // Data
        int rowIdx = 1;
        AtomicInteger index = new AtomicInteger(1);
        for (ADTopSellingProductsResponse item : data) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(index.getAndIncrement());
            row.createCell(1).setCellValue(item.getName());
            row.createCell(2).setCellValue(item.getPrice() != null ? item.getPrice().doubleValue() : 0);
            row.createCell(3).setCellValue(item.getSoldCount() != null ? item.getSoldCount().doubleValue() : 0);
        }
        autoSizeColumns(sheet, headers.length);
    }

    private void createLowStockSheet(Workbook workbook) {
        Sheet sheet = workbook.createSheet("Sắp Hết Hàng");
        List<ADLowstockProductResponse> data = adStatisticsRepository.getLowStockProducts();

        // Header
        Row headerRow = sheet.createRow(0);
        String[] headers = {"STT", "Tên Sản Phẩm", "Tồn Kho", "Giá Nhập"};
        createHeader(workbook, headerRow, headers);

        // Data
        int rowIdx = 1;
        AtomicInteger index = new AtomicInteger(1);
        for (ADLowstockProductResponse item : data) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(index.getAndIncrement());
            row.createCell(1).setCellValue(item.getName());
            row.createCell(2).setCellValue(item.getQuantity());
            row.createCell(3).setCellValue(item.getPrice() != null ? item.getPrice().doubleValue() : 0);
        }
        autoSizeColumns(sheet, headers.length);
    }

    private void createHeader(Workbook workbook, Row headerRow, String[] headers) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);

        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(style);
        }
    }

    private void autoSizeColumns(Sheet sheet, int count) {
        for (int i = 0; i < count; i++) {
            sheet.autoSizeColumn(i);
        }
    }


    private void createDashboardSheet(Workbook workbook) {
        Sheet sheet = workbook.createSheet("Tổng quan (Dashboard)");
        ADDashboardResponse data = getDashboardOverview();

        Row headerRow = sheet.createRow(0);
        String[] headers = {"Thời gian", "Doanh thu (VNĐ)", "Số đơn hàng", "Sản phẩm đã bán"};
        createHeader(workbook, headerRow, headers);

        CellStyle currencyStyle = workbook.createCellStyle();
        currencyStyle.setDataFormat(workbook.createDataFormat().getFormat("#,##0"));

        int rowIdx = 1;

        createDashboardRow(sheet, rowIdx++, "Hôm nay",
                data.getRevenueToday(), data.getOrdersToday(), data.getProductsSoldToday(), currencyStyle);

        createDashboardRow(sheet, rowIdx++, "Tuần này",
                data.getRevenueThisWeek(), data.getOrdersThisWeek(), data.getProductsSoldThisWeek(), currencyStyle);

        createDashboardRow(sheet, rowIdx++, "Tháng này",
                data.getRevenueThisMonth(), data.getOrdersThisMonth(), data.getProductsSoldThisMonth(), currencyStyle);

        createDashboardRow(sheet, rowIdx++, "Năm này",
                data.getRevenueThisYear(), data.getOrdersThisYear(), data.getProductsSoldThisYear(), currencyStyle);

        rowIdx++;
        Row growthRow = sheet.createRow(rowIdx);
        Cell labelCell = growthRow.createCell(0);
        labelCell.setCellValue("Tăng trưởng doanh thu (Tháng này vs Tháng trước):");

        CellStyle boldStyle = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        boldStyle.setFont(font);
        labelCell.setCellStyle(boldStyle);

        Cell valueCell = growthRow.createCell(1);
        Double growth = data.getGrowthPercentage() != null ? data.getGrowthPercentage() : 0.0;
        valueCell.setCellValue(growth / 100.0);

        CellStyle percentStyle = workbook.createCellStyle();
        percentStyle.setDataFormat(workbook.createDataFormat().getFormat("0.00%"));
        if (growth < 0) {
            Font redFont = workbook.createFont();
            redFont.setColor(IndexedColors.RED.getIndex());
            percentStyle.setFont(redFont);
        } else {
            Font greenFont = workbook.createFont();
            greenFont.setColor(IndexedColors.GREEN.getIndex());
            percentStyle.setFont(greenFont);
        }
        valueCell.setCellStyle(percentStyle);

        autoSizeColumns(sheet, 4);
        sheet.setColumnWidth(0, 8000);
    }

    private void createDashboardRow(Sheet sheet, int rowIdx, String label,
                                    BigDecimal revenue, Long orders, Long products,
                                    CellStyle currencyStyle) {
        Row row = sheet.createRow(rowIdx);

        row.createCell(0).setCellValue(label);

        Cell revCell = row.createCell(1);
        revCell.setCellValue(revenue != null ? revenue.doubleValue() : 0);
        revCell.setCellStyle(currencyStyle);

        row.createCell(2).setCellValue(orders != null ? orders : 0);
        row.createCell(3).setCellValue(products != null ? products : 0);
    }

    private void createGrowthSheet(Workbook workbook) {
        Sheet sheet = workbook.createSheet("Tốc độ tăng trưởng");
        List<ADGrowthStatResponse> data = getStoreGrowth();

        // Header
        Row headerRow = sheet.createRow(0);
        String[] headers = {"STT", "Chỉ mục", "Giá trị hiện tại", "Tăng trưởng (%)", "Đánh giá"};
        createHeader(workbook, headerRow, headers);

        // Data
        int rowIdx = 1;
        AtomicInteger index = new AtomicInteger(1);

        // Tạo style cho % (Optional)
        CellStyle percentStyle = workbook.createCellStyle();
        percentStyle.setDataFormat(workbook.createDataFormat().getFormat("0.00%"));

        for (ADGrowthStatResponse item : data) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(index.getAndIncrement());
            row.createCell(1).setCellValue(item.getLabel()); // VD: Doanh thu ngày

            // Giá trị
            row.createCell(2).setCellValue(item.getValue() != null ? item.getValue().doubleValue() : 0);

            // Phần trăm tăng trưởng
            Cell growthCell = row.createCell(3);
            double growthVal = item.getGrowth() != null ? item.getGrowth() : 0.0;
            growthCell.setCellValue(growthVal / 100.0); // Excel lưu % dưới dạng thập phân (0.15 = 15%)
            growthCell.setCellStyle(percentStyle);

            // Đánh giá text
            String status = growthVal > 0 ? "Tăng" : (growthVal < 0 ? "Giảm" : "Đi ngang");
            row.createCell(4).setCellValue(status);
        }
        autoSizeColumns(sheet, headers.length);
    }

    private void createOrderStatusSheet(Workbook workbook, Long startDate, Long endDate) {
        Sheet sheet = workbook.createSheet("Trạng thái đơn hàng");
        List<ADOrderStatusStatResponse> data = getOrderStatusStats(TimeRangeType.CUSTOM, startDate, endDate);

        // Header
        Row headerRow = sheet.createRow(0);
        String[] headers = {"STT", "Trạng thái", "Số lượng đơn", "Tỷ lệ"};
        createHeader(workbook, headerRow, headers);

        // Tính tổng để tính %
        long totalOrders = data.stream().mapToLong(ADOrderStatusStatResponse::getCount).sum();

        // Data
        int rowIdx = 1;
        AtomicInteger index = new AtomicInteger(1);
        for (ADOrderStatusStatResponse item : data) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(index.getAndIncrement());

            // Translate trạng thái nếu cần (Hoặc để nguyên status code)
            row.createCell(1).setCellValue(item.getStatus());

            row.createCell(2).setCellValue(item.getCount());

            // Tính tỷ lệ %
            double percent = totalOrders > 0 ? (double) item.getCount() / totalOrders : 0;
            Cell percentCell = row.createCell(3);
            percentCell.setCellValue(percent);

            // Format %
            CellStyle percentStyle = workbook.createCellStyle();
            percentStyle.setDataFormat(workbook.createDataFormat().getFormat("0.00%"));
            percentCell.setCellStyle(percentStyle);
        }
        autoSizeColumns(sheet, headers.length);
    }
}
