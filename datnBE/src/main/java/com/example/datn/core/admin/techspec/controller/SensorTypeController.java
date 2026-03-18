package com.example.datn.core.admin.techspec.controller;

import com.example.datn.core.admin.techspec.model.request.SensorTypeRequest;
import com.example.datn.core.admin.techspec.model.request.SensorTypeSearchRequest;
import com.example.datn.core.admin.techspec.model.response.SensorTypeResponse;
import com.example.datn.core.admin.techspec.service.SensorTypeService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.MappingConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(MappingConstants.ADMIN_TECH_SPEC + "/sensor-type")
@RequiredArgsConstructor
public class SensorTypeController {

    private final SensorTypeService service;

    @GetMapping
    public ResponseObject<PageableObject<SensorTypeResponse>> search(
            @ModelAttribute SensorTypeSearchRequest request) {
        return ResponseObject.<PageableObject<SensorTypeResponse>>builder()
                .status(HttpStatus.OK)
                .data(service.search(request))
                .build();
    }

    @GetMapping("/{id}")
    public ResponseObject<SensorTypeResponse> findById(@PathVariable String id) {
        return ResponseObject.<SensorTypeResponse>builder()
                .status(HttpStatus.OK)
                .data(service.findById(id))
                .build();
    }

    @PostMapping
    public ResponseObject<SensorTypeResponse> create(
            @Valid @RequestBody SensorTypeRequest request) {
        return ResponseObject.<SensorTypeResponse>builder()
                .status(HttpStatus.CREATED)
                .data(service.create(request))
                .build();
    }

    @PutMapping("/{id}")
    public ResponseObject<SensorTypeResponse> update(
            @PathVariable String id,
            @Valid @RequestBody SensorTypeRequest request) {
        return ResponseObject.<SensorTypeResponse>builder()
                .status(HttpStatus.OK)
                .data(service.update(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ResponseObject<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseObject.<Void>builder()
                .status(HttpStatus.OK)
                .message("Xóa loại cảm biến thành công")
                .build();
    }
}

