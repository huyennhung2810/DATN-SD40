package com.example.datn.core.admin.productcategory.controller;

import com.example.datn.core.admin.productcategory.model.request.ADProductCategoryRequest;
import com.example.datn.core.admin.productcategory.model.request.ADProductCategorySearchRequest;
import com.example.datn.core.admin.productcategory.model.response.ADProductCategoryResponse;
import com.example.datn.core.admin.productcategory.service.ADProductCategoryService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.MappingConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(MappingConstants.ADMIN_PRODUCT_CATEGORY)
@RequiredArgsConstructor
public class ADProductCategoryController {

    private final ADProductCategoryService service;

    @GetMapping
    public ResponseObject<PageableObject<ADProductCategoryResponse>> search(
            @ModelAttribute ADProductCategorySearchRequest request) {
        return ResponseObject.<PageableObject<ADProductCategoryResponse>>builder()
            .isSuccess(true)
            .status(HttpStatus.OK)
            .data(service.search(request))
            .message("Lấy danh sách danh mục thành công")
            .build();
    }

    @GetMapping("/{id}")
    public ResponseObject<ADProductCategoryResponse> findById(@PathVariable String id) {
        return ResponseObject.<ADProductCategoryResponse>builder()
            .status(HttpStatus.OK)
            .data(service.findById(id))
            .build();
    }

    @PostMapping
    public ResponseObject<ADProductCategoryResponse> create(
            @Valid @RequestBody ADProductCategoryRequest request) {
        return ResponseObject.<ADProductCategoryResponse>builder()
            .isSuccess(true)
            .status(HttpStatus.CREATED)
            .data(service.create(request))
            .message("Thêm mới danh mục thành công")
            .build();
    }

    @PutMapping("/{id}")
    public ResponseObject<ADProductCategoryResponse> update(
            @PathVariable String id,
            @Valid @RequestBody ADProductCategoryRequest request) {
        return ResponseObject.<ADProductCategoryResponse>builder()
            .isSuccess(true)
            .status(HttpStatus.OK)
            .data(service.update(id, request))
            .message("Cập nhật danh mục thành công")
            .build();
    }

    @DeleteMapping("/{id}")
    public ResponseObject<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseObject.<Void>builder()
            .status(HttpStatus.OK)
            .message("Xóa danh mục thành công")
            .build();
    }
}