package com.example.datn.core.admin.brand.controller;

import com.example.datn.core.admin.brand.model.request.ADBrandRequest;
import com.example.datn.core.admin.brand.model.request.ADBrandSearchRequest;
import com.example.datn.core.admin.brand.model.response.ADBrandResponse;
import com.example.datn.core.admin.brand.service.ADBrandService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.MappingConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(MappingConstants.ADMIN_BRAND)
@RequiredArgsConstructor
public class ADBrandController {

    private final ADBrandService service;

    @GetMapping
    public ResponseObject<PageableObject<ADBrandResponse>> search(
            @ModelAttribute ADBrandSearchRequest request) {
        return ResponseObject.<PageableObject<ADBrandResponse>>builder()
            .isSuccess(true)
            .status(HttpStatus.OK)
            .data(service.search(request))
            .message("Lấy danh sách thương hiệu thành công")
            .build();
    }

    @GetMapping("/{id}")
    public ResponseObject<ADBrandResponse> findById(@PathVariable String id) {
        return ResponseObject.<ADBrandResponse>builder()
            .status(HttpStatus.OK)
            .data(service.findById(id))
            .build();
    }

    @PostMapping
    public ResponseObject<ADBrandResponse> create(
            @Valid @RequestBody ADBrandRequest request) {
        return ResponseObject.<ADBrandResponse>builder()
            .isSuccess(true)
            .status(HttpStatus.CREATED)
            .data(service.create(request))
            .message("Thêm mới thương hiệu thành công")
            .build();
    }

    @PutMapping("/{id}")
    public ResponseObject<ADBrandResponse> update(
            @PathVariable String id,
            @Valid @RequestBody ADBrandRequest request) {
        return ResponseObject.<ADBrandResponse>builder()
            .isSuccess(true)
            .status(HttpStatus.OK)
            .data(service.update(id, request))
            .message("Cập nhật thương hiệu thành công")
            .build();
    }

    @DeleteMapping("/{id}")
    public ResponseObject<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseObject.<Void>builder()
            .status(HttpStatus.OK)
            .message("Xóa thương hiệu thành công")
            .build();
    }
}
