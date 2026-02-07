package com.example.datn.core.admin.techspec.controller;

import com.example.datn.core.admin.techspec.model.request.LensMountRequest;
import com.example.datn.core.admin.techspec.model.request.LensMountSearchRequest;
import com.example.datn.core.admin.techspec.model.response.LensMountResponse;
import com.example.datn.core.admin.techspec.service.LensMountService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.MappingConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(MappingConstants.ADMIN_TECH_SPEC + "/lens-mount")
@RequiredArgsConstructor
public class LensMountController {

    private final LensMountService service;

    @GetMapping
    public ResponseObject<PageableObject<LensMountResponse>> search(
            @ModelAttribute LensMountSearchRequest request) {
        return ResponseObject.<PageableObject<LensMountResponse>>builder()
                .status(HttpStatus.OK)
                .data(service.search(request))
                .build();
    }

    @GetMapping("/{id}")
    public ResponseObject<LensMountResponse> findById(@PathVariable String id) {
        return ResponseObject.<LensMountResponse>builder()
                .status(HttpStatus.OK)
                .data(service.findById(id))
                .build();
    }

    @PostMapping
    public ResponseObject<LensMountResponse> create(
            @Valid @RequestBody LensMountRequest request) {
        return ResponseObject.<LensMountResponse>builder()
                .status(HttpStatus.CREATED)
                .data(service.create(request))
                .build();
    }

    @PutMapping("/{id}")
    public ResponseObject<LensMountResponse> update(
            @PathVariable String id,
            @Valid @RequestBody LensMountRequest request) {
        return ResponseObject.<LensMountResponse>builder()
                .status(HttpStatus.OK)
                .data(service.update(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ResponseObject<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseObject.<Void>builder()
                .status(HttpStatus.OK)
                .message("Xóa ngàm lens thành công")
                .build();
    }
}

