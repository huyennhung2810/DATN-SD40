package com.example.datn.core.admin.serial.controller;

import com.example.datn.core.admin.serial.model.request.ADSerialRequest;
import com.example.datn.core.admin.serial.service.ADSerialService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.MappingConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping(MappingConstants.API_ADMIN_PREFIX_SERIALS)
@RequiredArgsConstructor
@Slf4j
public class ADSerialController {

    private final ADSerialService adSerialService;

    @GetMapping
    public ResponseObject<?> getAllSerials(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "status", required = false) EntityStatus status,
            @RequestParam(name = "productCategoryId", required = false) String productCategoryId,
            @RequestParam(name = "productId", required = false) String productId
    ) {
        return adSerialService.getAllSerials(keyword, status, productCategoryId, productId);
    }

    @GetMapping("/product-detail/{productDetailId}")
    public ResponseObject<?> getSerialByProductDetailId(@PathVariable String productDetailId) {
        return adSerialService.findByProductDetailId(productDetailId);
    }

    @GetMapping("/{id}")
    public ResponseObject<?> getSerialById(@PathVariable String id) {
        return adSerialService.findById(id);
    }

    @PostMapping
    public ResponseEntity<?> addSerial(@Valid @RequestBody ADSerialRequest serial) {
        return adSerialService.createSerial(serial);
    }

    @PutMapping("/{serialId}")
    public ResponseEntity<?> updateSerial(@Valid @PathVariable String serialId, @RequestBody ADSerialRequest serial) {
        return adSerialService.updateSerial(serialId, serial);
    }
}
