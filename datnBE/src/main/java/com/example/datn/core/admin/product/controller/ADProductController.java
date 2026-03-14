package com.example.datn.core.admin.product.controller;

import com.example.datn.core.admin.product.model.request.ADProductRequest;
import com.example.datn.core.admin.product.model.request.ADProductSearchRequest;
import com.example.datn.core.admin.product.model.request.UpdateVariantImageRequest;
import com.example.datn.core.admin.product.model.response.ADProductResponse;
import com.example.datn.core.admin.product.model.response.ADProductVariantResponse;
import com.example.datn.core.admin.product.model.response.ADProductWithVariantsResponse;
import com.example.datn.core.admin.product.service.ADProductService;
import com.example.datn.core.admin.productDetail.model.request.ADProductDetailRequest;
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

    // API lấy sản phẩm kèm danh sách biến thể con
    @GetMapping("/{id}/variants")
    public ResponseObject<ADProductWithVariantsResponse> getProductWithVariants(@PathVariable String id) {
        return ResponseObject.<ADProductWithVariantsResponse>builder()
            .isSuccess(true)
            .status(HttpStatus.OK)
            .data(service.getProductWithVariants(id))
            .message("Lấy thông tin sản phẩm và danh sách biến thể thành công")
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

    // API thêm biến thể cho sản phẩm
    @PostMapping("/{id}/variants")
    public ResponseObject<ADProductVariantResponse> addVariant(
            @PathVariable String id,
            @Valid @RequestBody ADProductDetailRequest request) {
        return ResponseObject.<ADProductVariantResponse>builder()
            .isSuccess(true)
            .status(HttpStatus.CREATED)
            .data(service.addVariant(id, request))
            .message("Thêm biến thể sản phẩm thành công")
            .build();
    }

    // API cập nhật biến thể
    @PutMapping("/variants/{variantId}")
    public ResponseObject<ADProductVariantResponse> updateVariant(
            @PathVariable String variantId,
            @Valid @RequestBody ADProductDetailRequest request) {
        return ResponseObject.<ADProductVariantResponse>builder()
            .isSuccess(true)
            .status(HttpStatus.OK)
            .data(service.updateVariant(variantId, request))
            .message("Cập nhật biến thể sản phẩm thành công")
            .build();
    }

    // API cập nhật ảnh đại diện cho biến thể (lưu ngay khi chọn)
    @PutMapping("/variants/{variantId}/image")
    public ResponseObject<ADProductVariantResponse> updateVariantImage(
            @PathVariable String variantId,
            @RequestBody UpdateVariantImageRequest request) {
        return ResponseObject.<ADProductVariantResponse>builder()
            .isSuccess(true)
            .status(HttpStatus.OK)
            .data(service.updateVariantImage(variantId, request.getSelectedImageId()))
            .message("Cập nhật ảnh đại diện biến thể thành công")
            .build();
    }

    // API xóa biến thể
    @DeleteMapping("/variants/{variantId}")
    public ResponseObject<Void> deleteVariant(@PathVariable String variantId) {
        service.deleteVariant(variantId);
        return ResponseObject.<Void>builder()
            .isSuccess(true)
            .status(HttpStatus.OK)
            .message("Xóa biến thể sản phẩm thành công")
            .build();
    }
}