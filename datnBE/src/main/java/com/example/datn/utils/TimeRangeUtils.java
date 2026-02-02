package com.example.datn.utils;

import com.example.datn.infrastructure.constant.TimeRangeType;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

public class TimeRangeUtils {

    private static final ZoneId ZONE_ID = ZoneId.of("Asia/Ho_Chi_Minh");

    public static TimeRange getRange (TimeRangeType type) {
        LocalDateTime start;
        LocalDateTime end = LocalDateTime.now();

        switch (type) {
            case TODAY -> start = LocalDate.now().atStartOfDay();
            case WEEK -> start = LocalDate.now().with(DayOfWeek.MONDAY).atStartOfDay();
            case MONTH -> start = LocalDate.now().withDayOfMonth(1).atStartOfDay();
            case YEAR -> start = LocalDate.now().withDayOfYear(1).atStartOfDay();
            default -> throw new IllegalArgumentException("Invalid TimeRangeType");
        }

        return  new TimeRange(
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
            case WEEK -> {
                start = today.minusWeeks(1).with(DayOfWeek.MONDAY).atStartOfDay();
                end = today.with(DayOfWeek.MONDAY).atStartOfDay().minusNanos(1);
            }
            case MONTH -> {
                start = today.minusMonths(1).withDayOfMonth(1).atStartOfDay();
                end = today.withDayOfMonth(1).atStartOfDay().minusNanos(1);
            }
            case YEAR -> {
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
