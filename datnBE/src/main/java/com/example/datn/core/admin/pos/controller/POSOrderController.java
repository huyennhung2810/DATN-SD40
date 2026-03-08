package com.example.datn.core.admin.pos.controller;

import com.example.datn.core.admin.pos.service.ADPosOrderService;
import com.example.datn.core.common.base.ResponseObject;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/pos/orders")
@RequiredArgsConstructor
public class POSOrderController {

    private final ADPosOrderService posOrderService;

    @PostMapping
    public ResponseEntity<?> createEmptyOrder() {
        return ResponseEntity.ok(posOrderService.createEmptyOrder());
    }

    @PostMapping("/{orderId}/add-product")
    public ResponseEntity<?> addProductToOrder(@PathVariable String orderId,
            @RequestParam String productDetailId, @RequestParam(defaultValue = "1") int quantity) {
        return ResponseEntity.ok(posOrderService.addProductToOrder(orderId, productDetailId, quantity));
    }

    @PostMapping("/{orderId}/details/{detailId}/assign-serials")
    public ResponseEntity<?> assignSerialsToOrderDetail(@PathVariable String orderId,
            @PathVariable String detailId,
            @RequestBody List<String> serialNumbers) {
        return ResponseEntity.ok(posOrderService.assignSerialsToOrderDetail(orderId, detailId, serialNumbers));
    }

    @GetMapping
    public ResponseEntity<?> getPendingOrders() {
        return ResponseEntity.ok(posOrderService.getPendingOrders());
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderDetails(@PathVariable String orderId) {
        return ResponseEntity.ok(posOrderService.getOrderDetails(orderId));
    }

    @DeleteMapping("/{orderId}/details/{detailId}/remove-product")
    public ResponseEntity<?> removeProductFromOrder(@PathVariable String orderId,
            @PathVariable String detailId) {
        return ResponseEntity.ok(posOrderService.removeProductFromOrder(orderId, detailId));
    }

    @DeleteMapping("/{orderId}/details/{detailId}/remove-serial")
    public ResponseEntity<?> removeSerialFromOrderDetail(@PathVariable String orderId,
            @PathVariable String detailId,
            @RequestParam String serialNumber) {
        return ResponseEntity.ok(posOrderService.removeSerialFromOrderDetail(orderId, detailId, serialNumber));
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

    @DeleteMapping("/{orderId}")
    public ResponseEntity<?> cancelOrder(@PathVariable String orderId) {
        return ResponseEntity.ok(posOrderService.cancelOrder(orderId));
    }
}
