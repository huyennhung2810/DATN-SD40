package com.example.datn.core.client.shipping.controller;

import com.example.datn.core.client.shipping.service.GHNShippingService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/client/shipping")
@RequiredArgsConstructor
public class ClientShippingController {

    private final GHNShippingService ghnShippingService;

    @PostMapping("/ghn/fee")
    public ResponseEntity<?> calculateGhnFee(@RequestBody GhnFeeRequest request) {
        BigDecimal fee = ghnShippingService.calculateFee(
                request.getToDistrictId(),
                request.getToWardCode(),
                request.getQuantity(),
                request.getTotalOrderValue()
        );
        Map<String, Object> response = new HashMap<>();
        response.put("fee", fee);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ghn/provinces")
    public ResponseEntity<?> getProvinces() {
        return ResponseEntity.ok(ghnShippingService.getProvinces());
    }

    @GetMapping("/ghn/districts")
    public ResponseEntity<?> getDistricts(@RequestParam("province_id") Integer provinceId) {
        return ResponseEntity.ok(ghnShippingService.getDistricts(provinceId));
    }

    @GetMapping("/ghn/wards")
    public ResponseEntity<?> getWards(@RequestParam("district_id") Integer districtId) {
        return ResponseEntity.ok(ghnShippingService.getWards(districtId));
    }

    @Data
    public static class GhnFeeRequest {
        private Integer toDistrictId;
        private String toWardCode;
        private int quantity;
        private BigDecimal totalOrderValue;
    }
}
