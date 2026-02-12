package com.example.datn.core.admin.workSchedule.model.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ADScheduleSearchRequest {

    private LocalDate fromDate;
    private LocalDate toDate;
    private String employeeId;
    private String shiftTemplateId;
}
