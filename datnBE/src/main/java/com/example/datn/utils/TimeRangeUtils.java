package com.example.datn.utils;

import com.example.datn.infrastructure.constant.TimeRangeType;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;

public class TimeRangeUtils {

    private static final ZoneId ZONE_ID = ZoneId.of("Asia/Ho_Chi_Minh");

    public static TimeRange getRange(TimeRangeType type) {
        LocalDate today = LocalDate.now(ZONE_ID);
        LocalDateTime start;
        LocalDateTime end = LocalDateTime.now(ZONE_ID); // Thời điểm hiện tại

        switch (type) {
            case TODAY -> start = today.atStartOfDay();

            case WEEK, THIS_WEEK -> start = today.with(DayOfWeek.MONDAY).atStartOfDay();

            case MONTH, THIS_MONTH -> start = today.with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();

            case YEAR, THIS_YEAR -> start = today.with(TemporalAdjusters.firstDayOfYear()).atStartOfDay();

            default -> throw new IllegalArgumentException("Unsupported TimeRangeType: " + type);
        }

        return new TimeRange(
                toMillis(start),
                toMillis(end)
        );
    }

    public static TimeRange getPreviousRange(TimeRangeType type) {
        LocalDate today = LocalDate.now(ZONE_ID);
        LocalDateTime start;
        LocalDateTime end;

        switch (type) {
            case TODAY -> {
                // Hôm qua: Bắt đầu 00:00 hôm qua -> Kết thúc 23:59:59.999 hôm qua
                LocalDate yesterday = today.minusDays(1);
                start = yesterday.atStartOfDay();
                end = yesterday.atTime(LocalTime.MAX);
            }
            case WEEK, THIS_WEEK -> {
                // Tuần trước: T2 tuần trước -> CN tuần trước (cuối ngày)
                LocalDate lastWeekMonday = today.minusWeeks(1).with(DayOfWeek.MONDAY);
                LocalDate lastWeekSunday = lastWeekMonday.plusDays(6);

                start = lastWeekMonday.atStartOfDay();
                end = lastWeekSunday.atTime(LocalTime.MAX);
            }
            case MONTH, THIS_MONTH -> {
                // Tháng trước: Ngày 1 tháng trước -> Ngày cuối tháng trước
                LocalDate lastMonth = today.minusMonths(1);
                start = lastMonth.with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();
                end = lastMonth.with(TemporalAdjusters.lastDayOfMonth()).atTime(LocalTime.MAX);
            }
            case YEAR, THIS_YEAR -> {
                // Năm trước: 1/1 năm trước -> 31/12 năm trước
                LocalDate lastYear = today.minusYears(1);
                start = lastYear.with(TemporalAdjusters.firstDayOfYear()).atStartOfDay();
                end = lastYear.with(TemporalAdjusters.lastDayOfYear()).atTime(LocalTime.MAX);
            }
            default -> throw new IllegalArgumentException("Unsupported TimeRangeType: " + type);
        }

        return new TimeRange(
                toMillis(start),
                toMillis(end)
        );
    }

    private static Long toMillis(LocalDateTime localDateTime) {
        return localDateTime.atZone(ZONE_ID).toInstant().toEpochMilli();
    }
}