package com.example.datn.core.admin.workSchedule.model.response;

import com.example.datn.infrastructure.constant.ShiftStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class ADWorkScheduleResponse {
    private String id;
    private String employeeId;
    private String employeeName;
    private String employeeCode;

    private String shiftTemplateId;
    private String shiftName;
    private LocalTime startTime;
    private LocalTime endTime;

    private LocalDate workDate;
    private ShiftStatus status;

}
