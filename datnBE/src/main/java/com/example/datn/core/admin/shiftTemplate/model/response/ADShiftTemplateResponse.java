package com.example.datn.core.admin.shiftTemplate.model.response;

import lombok.Data;

import java.time.LocalTime;

@Data
public class ADShiftTemplateResponse {
    private String id;
    private String code;
    private String name;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
    private Boolean isActive;
}
