package com.example.datn.core.admin.productdetail.controller;

import com.example.datn.core.admin.productdetail.model.request.ADProductDetailRequest;
import com.example.datn.core.admin.productdetail.service.ADProductDetailService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.MappingConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(MappingConstants.API_ADMIN_PREFIX_PRODUCTS_DETAIL)
@RequiredArgsConstructor
@Slf4j
public class ADProductDetailController {

    private final ADProductDetailService adProductDetailService;

    @GetMapping
    public ResponseObject<?> getAllProductDetails(String keyword, EntityStatus status) {
        return adProductDetailService.getAllProductDetails(keyword, status);
    }

    @GetMapping("/{id}")
    public ResponseObject<?> getProductDetailById(@PathVariable String id) {
        return adProductDetailService.getById(id);
    }

    @PostMapping
    public ResponseObject<?> addProductDetail(@Valid @RequestBody ADProductDetailRequest adProductDetailRequest) {
        return adProductDetailService.createProductDetail(adProductDetailRequest);
    }

    @PutMapping("/{id}")
    public ResponseObject<?> updateProductDetail(@Valid @PathVariable String id, @RequestBody ADProductDetailRequest adProductDetailRequest) {
        return adProductDetailService.updateProductDetail(id, adProductDetailRequest);
    }
}

