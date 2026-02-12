package com.example.datn.core.admin.workSchedule.controller;

import com.example.datn.core.admin.workSchedule.model.request.ADCreateScheduleRequest;
import com.example.datn.core.admin.workSchedule.model.request.ADScheduleSearchRequest;
import com.example.datn.core.admin.workSchedule.service.ADWorkScheduleService;
import com.example.datn.infrastructure.constant.MappingConstants;
import com.example.datn.utils.Helper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(MappingConstants.API_ADMIN_PREFIX_WORK_SCHEDULE)
@RequiredArgsConstructor
@Slf4j
public class ADWorkScheduleController {

    private final ADWorkScheduleService workScheduleService;

    @GetMapping
    public ResponseEntity<?> getSchedules(ADScheduleSearchRequest request) {
        return Helper.createResponseEntity(workScheduleService.getSchedules(request));
    }

    @PostMapping
    public ResponseEntity<?> assignShift(@RequestBody @Valid ADCreateScheduleRequest request) {
        return Helper.createResponseEntity(workScheduleService.assignShift(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSchedule(@PathVariable("id") String id) {
        return Helper.createResponseEntity(workScheduleService.deleteSchedule(id));
    }
}
