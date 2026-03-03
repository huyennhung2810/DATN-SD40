package com.example.datn.core.admin.banner.controller;

import com.example.datn.core.admin.banner.model.request.ADBannerRequest;
import com.example.datn.core.admin.banner.model.request.ADBannerSearchRequest;
import com.example.datn.core.admin.banner.model.response.ADBannerResponse;
import com.example.datn.core.admin.banner.service.ADBannerService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.MappingConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(MappingConstants.ADMIN_BANNER)
@RequiredArgsConstructor
public class ADBannerController {

    private final ADBannerService service;

    @GetMapping
    public ResponseObject<PageableObject<ADBannerResponse>> search(
            @ModelAttribute ADBannerSearchRequest request) {
        return ResponseObject.<PageableObject<ADBannerResponse>>builder()
                .isSuccess(true)
                .status(HttpStatus.OK)
                .data(service.search(request))
                .message("Lấy danh sách banner thành công")
                .build();
    }

    @GetMapping("/{id}")
    public ResponseObject<ADBannerResponse> findById(@PathVariable String id) {
        return ResponseObject.<ADBannerResponse>builder()
                .isSuccess(true)
                .status(HttpStatus.OK)
                .data(service.findById(id))
                .message("Lấy thông tin banner thành công")
                .build();
    }

    @PostMapping
    public ResponseObject<ADBannerResponse> create(
            @Valid @RequestBody ADBannerRequest request) {
        return ResponseObject.<ADBannerResponse>builder()
                .isSuccess(true)
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
                .isSuccess(true)
                .status(HttpStatus.OK)
                .data(service.update(id, request))
                .message("Cập nhật banner thành công")
                .build();
    }

    @DeleteMapping("/{id}")
    public ResponseObject<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseObject.<Void>builder()
                .isSuccess(true)
                .status(HttpStatus.OK)
                .message("Xóa banner thành công")
                .build();
    }
}

