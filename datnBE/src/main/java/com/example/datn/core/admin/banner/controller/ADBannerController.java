package com.example.datn.core.admin.banner.controller;

import com.example.datn.core.admin.banner.model.request.ADBannerRequest;
import com.example.datn.core.admin.banner.model.request.ADBannerSearchRequest;
import com.example.datn.core.admin.banner.model.response.ADBannerResponse;
import com.example.datn.core.admin.banner.service.ADBannerService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.MappingConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(MappingConstants.ADMIN_BANNER)
@RequiredArgsConstructor
public class ADBannerController {

    private final ADBannerService service;

    @GetMapping
    public ResponseObject<PageableObject<ADBannerResponse>> search(
            @ModelAttribute ADBannerSearchRequest request) {
        return ResponseObject.<PageableObject<ADBannerResponse>>builder()
                .status(HttpStatus.OK)
                .data(service.search(request))
                .build();
    }

    @GetMapping("/{id}")
    public ResponseObject<ADBannerResponse> findById(@PathVariable String id) {
        return ResponseObject.<ADBannerResponse>builder()
                .status(HttpStatus.OK)
                .data(service.findById(id))
                .build();
    }

    @PostMapping
    public ResponseObject<ADBannerResponse> create(
            @Valid @RequestBody ADBannerRequest request) {
        return ResponseObject.<ADBannerResponse>builder()
                .status(HttpStatus.CREATED)
                .data(service.create(request))
                .message("Thêm mới banner thành công")
                .build();
    }

    @PutMapping("/{id}")
    public ResponseObject<ADBannerResponse> update(
            @PathVariable String id,
            @Valid @RequestBody ADBannerRequest request) {
        return ResponseObject.<ADBannerResponse>builder()
                .status(HttpStatus.OK)
                .data(service.update(id, request))
                .message("Cập nhật banner thành công")
                .build();
    }

    @DeleteMapping("/{id}")
    public ResponseObject<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseObject.<Void>builder()
                .status(HttpStatus.OK)
                .message("Xóa banner thành công")
                .build();
    }

    @PatchMapping("/{id}/status")
    public ResponseObject<ADBannerResponse> updateStatus(
            @PathVariable String id,
            @RequestParam EntityStatus status) {
        return ResponseObject.<ADBannerResponse>builder()
                .status(HttpStatus.OK)
                .data(service.updateStatus(id, status))
                .message("Cập nhật trạng thái banner thành công")
                .build();
    }

    // Public API for client
    @GetMapping("/active")
    public ResponseObject<List<ADBannerResponse>> getActiveBanners(
            @RequestParam(required = false) String slot) {
        return ResponseObject.<List<ADBannerResponse>>builder()
                .status(HttpStatus.OK)
                .data(service.getActiveBanners(slot))
                .build();
    }
}

