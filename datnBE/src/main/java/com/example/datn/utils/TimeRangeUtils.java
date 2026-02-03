package com.example.datn.utils;

import com.example.datn.infrastructure.constant.TimeRangeType;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

public class TimeRangeUtils {

    private static final ZoneId ZONE_ID = ZoneId.of("Asia/Ho_Chi_Minh");

    public static TimeRange getRange(TimeRangeType type) {
        LocalDateTime start;
        LocalDateTime end = LocalDateTime.now();

        switch (type) {
            case TODAY -> start = LocalDate.now().atStartOfDay();

            // Gộp case: Dù là WEEK hay THIS_WEEK đều chạy logic này
            case WEEK, THIS_WEEK -> start = LocalDate.now().with(DayOfWeek.MONDAY).atStartOfDay();

            // Gộp case: Dù là MONTH hay THIS_MONTH đều chạy logic này
            case MONTH, THIS_MONTH -> start = LocalDate.now().withDayOfMonth(1).atStartOfDay();

            // Gộp case: Fix lỗi YEAR mà bạn đang gặp
            case YEAR, THIS_YEAR -> start = LocalDate.now().withDayOfYear(1).atStartOfDay();

            default -> throw new IllegalArgumentException("Invalid TimeRangeType");
        }

        return new TimeRange(
                start.atZone(ZONE_ID).toInstant().toEpochMilli(),
                end.atZone(ZONE_ID).toInstant().toEpochMilli()
        );
    }

    public static TimeRange getPreviousRange(TimeRangeType type) {
        LocalDateTime start;
        LocalDateTime end;
        LocalDate today = LocalDate.now();

        switch (type) {
            case TODAY -> {
                start = today.minusDays(1).atStartOfDay();
                end = today.atStartOfDay().minusNanos(1);
            }
            // Gộp logic cho tuần trước
            case WEEK, THIS_WEEK -> {
                start = today.minusWeeks(1).with(DayOfWeek.MONDAY).atStartOfDay();
                end = today.with(DayOfWeek.MONDAY).atStartOfDay().minusNanos(1);
            }
            // Gộp logic cho tháng trước
            case MONTH, THIS_MONTH -> {
                start = today.minusMonths(1).withDayOfMonth(1).atStartOfDay();
                end = today.withDayOfMonth(1).atStartOfDay().minusNanos(1);
            }
            // Gộp logic cho năm trước
            case YEAR, THIS_YEAR -> {
                start = today.minusYears(1).withDayOfYear(1).atStartOfDay();
                end = today.withDayOfYear(1).atStartOfDay().minusNanos(1);
            }
            default -> throw new IllegalArgumentException("Invalid Type");
        }
        return new TimeRange(
                start.atZone(ZONE_ID).toInstant().toEpochMilli(),
                end.atZone(ZONE_ID).toInstant().toEpochMilli()
        );
    }
}