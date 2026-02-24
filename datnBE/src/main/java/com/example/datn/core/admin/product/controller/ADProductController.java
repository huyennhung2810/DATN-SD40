package com.example.datn.core.admin.product.controller;

import com.example.datn.core.admin.product.model.request.ADProductRequest;
import com.example.datn.core.admin.product.model.request.ADProductSearchRequest;
import com.example.datn.core.admin.product.model.response.ADProductResponse;
import com.example.datn.core.admin.product.service.ADProductService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.MappingConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(MappingConstants.ADMIN_PRODUCT)
@RequiredArgsConstructor
public class ADProductController {
    
    private final ADProductService service;
    
    @GetMapping
    public ResponseObject<PageableObject<ADProductResponse>> search(
            @ModelAttribute ADProductSearchRequest request) {
        return ResponseObject.<PageableObject<ADProductResponse>>builder()
            .isSuccess(true)
            .status(HttpStatus.OK)
            .data(service.search(request))
            .message("Lấy danh sách sản phẩm thành công")
            .build();
    }
    
    @GetMapping("/{id}")
    public ResponseObject<ADProductResponse> findById(@PathVariable String id) {
        return ResponseObject.<ADProductResponse>builder()
            .isSuccess(true)
            .status(HttpStatus.OK)
            .data(service.findById(id))
            .message("Lấy thông tin sản phẩm thành công")
            .build();
    }
    
    @PostMapping
    public ResponseObject<ADProductResponse> create(
            @Valid @RequestBody ADProductRequest request) {
        return ResponseObject.<ADProductResponse>builder()
            .isSuccess(true)
            .status(HttpStatus.CREATED)
            .data(service.create(request))
            .message("Thêm mới sản phẩm thành công")
            .build();
    }
    
    @PutMapping("/{id}")
    public ResponseObject<ADProductResponse> update(
            @PathVariable String id,
            @Valid @RequestBody ADProductRequest request) {
        return ResponseObject.<ADProductResponse>builder()
            .isSuccess(true)
            .status(HttpStatus.OK)
            .data(service.update(id, request))
            .message("Cập nhật sản phẩm thành công")
            .build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseObject<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseObject.<Void>builder()
            .isSuccess(true)
            .status(HttpStatus.OK)
            .message("Xóa sản phẩm thành công")
            .build();
    }
}