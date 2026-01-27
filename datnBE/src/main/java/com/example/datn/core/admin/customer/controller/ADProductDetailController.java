package com.example.datn.core.admin.customer.controller;

import com.example.datn.core.admin.customer.service.ADProductDetailService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.MappingConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(MappingConstants.API_ADMIN_PREFIX_PRODUCTS_DETAIL)
@RequiredArgsConstructor
@Slf4j
public class ADProductDetailController {

    private final ADProductDetailService adProductDetailService;

    @GetMapping
    public ResponseObject<?> getAllProductDetails() {
        return adProductDetailService.getAllProductDetails();
    }

    @GetMapping("/{productId}")
    public ResponseObject<?> getProductDetail(@PathVariable String productId) {
        return adProductDetailService.getAllProductDetailsByProductId(productId);
    }

//    @PostMapping
//    public
}
