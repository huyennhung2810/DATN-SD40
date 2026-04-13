package com.example.datn.core.admin.serial.controller;

import com.example.datn.core.admin.serial.model.request.ADSerialRequest;
import com.example.datn.core.admin.serial.service.ADSerialService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.MappingConstants;
import com.example.datn.infrastructure.constant.SerialStatus;
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

    @GetMapping // Hoặc @PostMapping(search) tùy dự án của bạn
    public ResponseEntity<?> getAllSerials(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) EntityStatus status,

            // BẮT BUỘC PHẢI THÊM DÒNG NÀY ĐỂ NHẬN DỮ LIỆU TỪ FRONTEND
            @RequestParam(required = false) SerialStatus serialStatus,

            @RequestParam(required = false) String productCategoryId,
            @RequestParam(required = false) String productId) {

        // Truyền serialStatus xuống Service
        return ResponseEntity.ok(adSerialService.getAllSerials(keyword, status, serialStatus, productCategoryId, productId));
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
