package com.example.datn.core.admin.serial.controller;

import com.example.datn.core.admin.serial.model.request.ADSerialRequest;
import com.example.datn.core.admin.serial.service.ADSerialService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.MappingConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(MappingConstants.API_ADMIN_PREFIX_SERIALS)
@RequiredArgsConstructor
@Slf4j
public class ADSerialController {

    private final ADSerialService adSerialService;

    @GetMapping
    public ResponseObject<?> getAllSerials() {
        return adSerialService.getAllSerials();
    }

    @GetMapping("/{productDetailId}")
    public ResponseObject<?> getSerialByProductDetailId(@PathVariable String productDetailId) {
        return adSerialService.findByProductDetailId(productDetailId);
    }

    @PostMapping
    public ResponseObject<?> addSerial(@Valid @RequestBody ADSerialRequest serial) {
        return adSerialService.createSerial(serial);
    }

    @PostMapping("/{serialId}")
    public ResponseObject<?> updateSerial(@Valid @PathVariable String serialId, @RequestBody ADSerialRequest serial) {
        return adSerialService.updateSerial(serialId, serial);
    }
}
