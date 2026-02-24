package com.example.datn.core.admin.shiftTemplate.model.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
public class ADShiftTemplateRequest {
    private String name;
    private LocalTime startTime;
    private LocalTime endTime;
}
