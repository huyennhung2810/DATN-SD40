package com.example.datn.core.admin.pos.controller;

import com.example.datn.core.admin.pos.service.ADPosOrderService;
import com.example.datn.core.common.base.ResponseObject;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/pos/orders")
@RequiredArgsConstructor
public class POSOrderController {

    private final ADPosOrderService posOrderService;

    @PostMapping
    public ResponseEntity<?> createEmptyOrder() {
        return ResponseEntity.ok(posOrderService.createEmptyOrder());
    }

    @PostMapping("/{orderId}/add-serial")
    public ResponseEntity<?> addSerialToOrder(@PathVariable String orderId,
            @RequestParam String serialNumber) {
        return ResponseEntity.ok(posOrderService.addSerialToOrder(orderId, serialNumber));
    }

    @GetMapping
    public ResponseEntity<?> getPendingOrders() {
        return ResponseEntity.ok(posOrderService.getPendingOrders());
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderDetails(@PathVariable String orderId) {
        return ResponseEntity.ok(posOrderService.getOrderDetails(orderId));
    }

    @DeleteMapping("/{orderId}/remove-serial")
    public ResponseEntity<?> removeSerialFromOrder(@PathVariable String orderId,
            @RequestParam String serialNumber) {
        return ResponseEntity.ok(posOrderService.removeSerialFromOrder(orderId, serialNumber));
    }

    @PutMapping("/{orderId}/customer")
    public ResponseEntity<?> setCustomerForOrder(@PathVariable String orderId,
            @RequestParam String customerId) {
        return ResponseEntity.ok(posOrderService.setCustomerForOrder(orderId, customerId));
    }

    @PostMapping("/{orderId}/checkout")
    public ResponseEntity<?> checkoutOrder(@PathVariable String orderId) {
        return ResponseEntity.ok(posOrderService.checkoutOrder(orderId));
    }
}
