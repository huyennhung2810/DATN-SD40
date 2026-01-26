package com.example.datn.core.admin.customer.controller;

import com.example.datn.core.admin.customer.service.ADSerialService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.Serial;
import com.example.datn.infrastructure.constant.MappingConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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

//    @GetMapping("/{productDetailId}")
//    public ResponseObject<?> getSerialByProductDetailId(@PathVariable String productDetailId) {
//
//    }
}
