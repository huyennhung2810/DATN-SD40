package com.example.datn.core.admin.handovers.controller;

import com.example.datn.core.admin.handovers.model.request.ADConfirmShiftRequest;
import com.example.datn.core.admin.handovers.model.request.ADShiftHandoverCheckInRequest;
import com.example.datn.core.admin.handovers.model.request.ADShiftHandoverCheckOutRequest;
import com.example.datn.core.admin.handovers.model.request.ADShiftHistoryRequest;
import com.example.datn.core.admin.handovers.service.ADShiftHandoverService;
import com.example.datn.core.common.base.ResponseObject;
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
        log.info("Thực hiện check-in cho lịch làm việc: {}", request.getScheduleId());
        ResponseObject<?> response = shiftHandoverService.checkIn(request);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getShiftStats(@RequestParam("scheduleId") String scheduleId) {
        log.info("Lấy thông tin thống kê cho ca: {}", scheduleId);
        return Helper.createResponseEntity(shiftHandoverService.getShiftStats(scheduleId));
    }

    @PostMapping("/check-out")
    public ResponseEntity<?> checkOut(@RequestBody @Valid ADShiftHandoverCheckOutRequest request) {
        log.info("Thực hiện kết ca (Check-out) cho lịch làm việc: {}", request.getScheduleId());
        return Helper.createResponseEntity(shiftHandoverService.checkOut(request));
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(ADShiftHistoryRequest request) {
        log.info("Admin xem lịch sử ca làm việc: {}", request);
        return Helper.createResponseEntity(shiftHandoverService.getShiftHistory(request));
    }

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmShift(@RequestBody @Valid ADConfirmShiftRequest request) {
        log.info("Admin xác nhận ca đang chờ xử lý: {}", request.getHandoverId());
        return Helper.createResponseEntity(shiftHandoverService.confirmShift(request));
    }
}