package com.example.datn.core.admin.techspec.controller;

import com.example.datn.core.admin.techspec.model.request.ImageFormatRequest;
import com.example.datn.core.admin.techspec.model.request.ImageFormatSearchRequest;
import com.example.datn.core.admin.techspec.model.response.ImageFormatResponse;
import com.example.datn.core.admin.techspec.service.ImageFormatService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.MappingConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(MappingConstants.ADMIN_TECH_SPEC + "/image-format")
@RequiredArgsConstructor
public class ImageFormatController {

    private final ImageFormatService service;

    @GetMapping
    public ResponseObject<PageableObject<ImageFormatResponse>> search(
            @ModelAttribute ImageFormatSearchRequest request) {
        return ResponseObject.<PageableObject<ImageFormatResponse>>builder()
                .status(HttpStatus.OK)
                .data(service.search(request))
                .build();
    }

    @GetMapping("/{id}")
    public ResponseObject<ImageFormatResponse> findById(@PathVariable String id) {
        return ResponseObject.<ImageFormatResponse>builder()
                .status(HttpStatus.OK)
                .data(service.findById(id))
                .build();
    }

    @PostMapping
    public ResponseObject<ImageFormatResponse> create(
            @Valid @RequestBody ImageFormatRequest request) {
        return ResponseObject.<ImageFormatResponse>builder()
                .status(HttpStatus.CREATED)
                .data(service.create(request))
                .build();
    }

    @PutMapping("/{id}")
    public ResponseObject<ImageFormatResponse> update(
            @PathVariable String id,
            @Valid @RequestBody ImageFormatRequest request) {
        return ResponseObject.<ImageFormatResponse>builder()
                .status(HttpStatus.OK)
                .data(service.update(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ResponseObject<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseObject.<Void>builder()
                .status(HttpStatus.OK)
                .message("Xóa định dạng ảnh thành công")
                .build();
    }
}

