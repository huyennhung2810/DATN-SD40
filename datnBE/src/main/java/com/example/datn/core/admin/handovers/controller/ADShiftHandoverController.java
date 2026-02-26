package com.example.datn.core.admin.handovers.controller;

import com.example.datn.core.admin.handovers.model.request.ADShiftHandoverCheckInRequest;
import com.example.datn.core.admin.handovers.model.request.ADShiftHandoverCheckOutRequest;
import com.example.datn.core.admin.handovers.service.ADShiftHandoverService;
import com.example.datn.infrastructure.constant.MappingConstants;
import com.example.datn.utils.Helper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(MappingConstants.API_ADMIN_PREFIX_SHIFT_HANDOVER)
@RequiredArgsConstructor
@Slf4j
public class ADShiftHandoverController {

    private final ADShiftHandoverService shiftHandoverService;

    @PostMapping("/check-in")
    public ResponseEntity<?> checkIn(@RequestBody @Valid ADShiftHandoverCheckInRequest request) {
        return Helper.createResponseEntity(shiftHandoverService.checkIn(request));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getShiftStats(@RequestParam("scheduleId") String scheduleId) {
        return Helper.createResponseEntity(shiftHandoverService.getShiftStats(scheduleId));
    }

    @PostMapping("/check-out")
    public ResponseEntity<?> checkOut(@RequestBody @Valid ADShiftHandoverCheckOutRequest request) {
        return Helper.createResponseEntity(shiftHandoverService.checkOut(request));
    }
}