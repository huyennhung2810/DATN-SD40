package com.example.datn.core.admin.techspec.controller;

import com.example.datn.core.admin.techspec.model.request.VideoFormatRequest;
import com.example.datn.core.admin.techspec.model.request.VideoFormatSearchRequest;
import com.example.datn.core.admin.techspec.model.response.VideoFormatResponse;
import com.example.datn.core.admin.techspec.service.VideoFormatService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.MappingConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(MappingConstants.ADMIN_TECH_SPEC + "/video-format")
@RequiredArgsConstructor
public class VideoFormatController {

    private final VideoFormatService service;

    @GetMapping
    public ResponseObject<PageableObject<VideoFormatResponse>> search(
            @ModelAttribute VideoFormatSearchRequest request) {
        return ResponseObject.<PageableObject<VideoFormatResponse>>builder()
                .status(HttpStatus.OK)
                .data(service.search(request))
                .build();
    }

    @GetMapping("/{id}")
    public ResponseObject<VideoFormatResponse> findById(@PathVariable String id) {
        return ResponseObject.<VideoFormatResponse>builder()
                .status(HttpStatus.OK)
                .data(service.findById(id))
                .build();
    }

    @PostMapping
    public ResponseObject<VideoFormatResponse> create(
            @Valid @RequestBody VideoFormatRequest request) {
        return ResponseObject.<VideoFormatResponse>builder()
                .status(HttpStatus.CREATED)
                .data(service.create(request))
                .build();
    }

    @PutMapping("/{id}")
    public ResponseObject<VideoFormatResponse> update(
            @PathVariable String id,
            @Valid @RequestBody VideoFormatRequest request) {
        return ResponseObject.<VideoFormatResponse>builder()
                .status(HttpStatus.OK)
                .data(service.update(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ResponseObject<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseObject.<Void>builder()
                .status(HttpStatus.OK)
                .message("Xóa định dạng video thành công")
                .build();
    }
}

