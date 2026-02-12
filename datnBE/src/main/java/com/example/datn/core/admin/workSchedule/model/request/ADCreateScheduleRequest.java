package com.example.datn.core.admin.workSchedule.model.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ADCreateScheduleRequest {

    private String employeeId;
    private String shiftTemplateId;
    private LocalDate workDate;
}
