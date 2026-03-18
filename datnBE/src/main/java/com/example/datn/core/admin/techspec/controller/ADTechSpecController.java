package com.example.datn.core.admin.techspec.controller;

import com.example.datn.core.admin.techspec.model.request.ADTechSpecRequest;
import com.example.datn.core.admin.techspec.model.request.ADTechSpecSearchRequest;
import com.example.datn.core.admin.techspec.model.response.ADTechSpecResponse;
import com.example.datn.core.admin.techspec.service.ADTechSpecService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.MappingConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(MappingConstants.ADMIN_TECH_SPEC)
@RequiredArgsConstructor
public class ADTechSpecController {

    private final ADTechSpecService service;

    @GetMapping
    public ResponseObject<PageableObject<ADTechSpecResponse>> search(
            @ModelAttribute ADTechSpecSearchRequest request) {
        return ResponseObject.<PageableObject<ADTechSpecResponse>>builder()
            .status(HttpStatus.OK)
            .data(service.search(request))
            .build();
    }

    @GetMapping("/{id}")
    public ResponseObject<ADTechSpecResponse> findById(@PathVariable String id) {
        return ResponseObject.<ADTechSpecResponse>builder()
            .status(HttpStatus.OK)
            .data(service.findById(id))
            .build();
    }

    @PostMapping
    public ResponseObject<ADTechSpecResponse> create(
            @Valid @RequestBody ADTechSpecRequest request) {
        return ResponseObject.<ADTechSpecResponse>builder()
            .status(HttpStatus.CREATED)
            .data(service.create(request))
            .build();
    }

    @PutMapping("/{id}")
    public ResponseObject<ADTechSpecResponse> update(
            @PathVariable String id,
            @Valid @RequestBody ADTechSpecRequest request) {
        return ResponseObject.<ADTechSpecResponse>builder()
            .status(HttpStatus.OK)
            .data(service.update(id, request))
            .build();
    }

    @DeleteMapping("/{id}")
    public ResponseObject<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseObject.<Void>builder()
            .status(HttpStatus.OK)
            .message("Xóa thông số kỹ thuật thành công")
            .build();
    }
}