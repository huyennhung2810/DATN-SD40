package com.example.datn.core.admin.techspec.controller;

import com.example.datn.core.admin.techspec.model.request.ProcessorRequest;
import com.example.datn.core.admin.techspec.model.request.ProcessorSearchRequest;
import com.example.datn.core.admin.techspec.model.response.ProcessorResponse;
import com.example.datn.core.admin.techspec.service.ProcessorService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.MappingConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(MappingConstants.ADMIN_TECH_SPEC + "/processor")
@RequiredArgsConstructor
public class ProcessorController {

    private final ProcessorService service;

    @GetMapping
    public ResponseObject<PageableObject<ProcessorResponse>> search(
            @ModelAttribute ProcessorSearchRequest request) {
        return ResponseObject.<PageableObject<ProcessorResponse>>builder()
                .status(HttpStatus.OK)
                .data(service.search(request))
                .build();
    }

    @GetMapping("/{id}")
    public ResponseObject<ProcessorResponse> findById(@PathVariable String id) {
        return ResponseObject.<ProcessorResponse>builder()
                .status(HttpStatus.OK)
                .data(service.findById(id))
                .build();
    }

    @PostMapping
    public ResponseObject<ProcessorResponse> create(
            @Valid @RequestBody ProcessorRequest request) {
        return ResponseObject.<ProcessorResponse>builder()
                .status(HttpStatus.CREATED)
                .data(service.create(request))
                .build();
    }

    @PutMapping("/{id}")
    public ResponseObject<ProcessorResponse> update(
            @PathVariable String id,
            @Valid @RequestBody ProcessorRequest request) {
        return ResponseObject.<ProcessorResponse>builder()
                .status(HttpStatus.OK)
                .data(service.update(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ResponseObject<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseObject.<Void>builder()
                .status(HttpStatus.OK)
                .message("Xóa bộ xử lý thành công")
                .build();
    }
}

