package com.example.datn.core.admin.shiftTemplate.controller;


import com.example.datn.core.admin.shiftTemplate.model.request.ADShiftTemplateRequest;
import com.example.datn.core.admin.shiftTemplate.model.response.ADShiftTemplateResponse;
import com.example.datn.core.admin.shiftTemplate.service.ADShiftTemplateService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.MappingConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping(MappingConstants.API_ADMIN_PREFIX_SHIFT_TEMPLATE)
@RequiredArgsConstructor
public class ADShiftTemplateController {

    private final ADShiftTemplateService service;

    @GetMapping
    public ResponseEntity<ResponseObject<List<ADShiftTemplateResponse>>> getAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) EntityStatus status,
            @RequestParam(required = false) String startTime, // Nhận dạng String để dễ convert
            @RequestParam(required = false) String endTime) {

        LocalTime start = (startTime != null && !startTime.isEmpty()) ? LocalTime.parse(startTime) : null;
        LocalTime end = (endTime != null && !endTime.isEmpty()) ? LocalTime.parse(endTime) : null;

        List<ADShiftTemplateResponse> data = service.getAll(keyword, status, start, end);
        return ResponseEntity.ok(ResponseObject.success(data, "Lấy danh sách ca làm việc thành công"));
    }

    @PostMapping
    public ResponseEntity<ResponseObject<ADShiftTemplateResponse>> create(@RequestBody ADShiftTemplateRequest request) {
        ADShiftTemplateResponse data = service.create(request);
        return ResponseEntity.ok(ResponseObject.success(data, "Tạo ca làm việc mẫu thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseObject<ADShiftTemplateResponse>> update(
            @PathVariable String id,
            @RequestBody ADShiftTemplateRequest request) {
        ADShiftTemplateResponse data = service.update(id, request);
        return ResponseEntity.ok(ResponseObject.success(data, "Cập nhật ca làm việc thành công"));
    }

    @PutMapping("/{id}/change-status")
    public ResponseEntity<ResponseObject<ADShiftTemplateResponse>> changeStatus(@PathVariable String id) {
        ADShiftTemplateResponse data = service.changeStatus(id);
        return ResponseEntity.ok(ResponseObject.success(data, "Cập nhật trạng thái thành công"));
    }
}
