package com.example.datn.core.admin.productimage.controller;

import com.example.datn.core.admin.productimage.model.request.ADProductImageRequest;
import com.example.datn.core.admin.productimage.model.response.ADProductImageResponse;
import com.example.datn.core.admin.productimage.service.ADProductImageService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.MappingConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping(MappingConstants.ADMIN_PRODUCT_IMAGE)
@RequiredArgsConstructor
public class ADProductImageController {

    private final ADProductImageService service;

    @GetMapping("/product/{productId}")
    public ResponseObject<List<ADProductImageResponse>> findByProductId(
            @PathVariable String productId) {
        return ResponseObject.<List<ADProductImageResponse>>builder()
                .status(HttpStatus.OK)
                .data(service.findByProductId(productId))
                .build();
    }

    @GetMapping("/{id}")
    public ResponseObject<ADProductImageResponse> findById(@PathVariable String id) {
        return ResponseObject.<ADProductImageResponse>builder()
                .status(HttpStatus.OK)
                .data(service.findById(id))
                .build();
    }

    // Ăn cả 'file' và 'image' param - Dễ vcl
    @PostMapping("/upload/{productId}")
    public ResponseObject<ADProductImageResponse> upload(
            @PathVariable String productId,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        MultipartFile fileToUpload = file != null ? file : image;

        if (fileToUpload == null || fileToUpload.isEmpty()) {
            return ResponseObject.<ADProductImageResponse>builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .message("File không được để trống")
                    .build();
        }

        return ResponseObject.<ADProductImageResponse>builder()
                .status(HttpStatus.CREATED)
                .data(service.upload(productId, fileToUpload))
                .message("Upload ảnh thành công")
                .build();
    }

    @PostMapping
    public ResponseObject<ADProductImageResponse> create(
            @Valid @RequestBody ADProductImageRequest request) {
        return ResponseObject.<ADProductImageResponse>builder()
                .status(HttpStatus.CREATED)
                .data(service.create(request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ResponseObject<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseObject.<Void>builder()
                .status(HttpStatus.OK)
                .message("Xóa ảnh thành công")
                .build();
    }
}