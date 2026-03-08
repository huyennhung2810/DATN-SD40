package com.example.datn.core.admin.order.controller;

import com.example.datn.core.admin.order.service.ADOrderService;
import com.example.datn.infrastructure.constant.OrderStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
public class ADOrderController {

    private final ADOrderService orderService;

    @GetMapping
    public ResponseEntity<?> searchOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.searchOrders(status, keyword, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderDetails(@PathVariable String id) {
        return ResponseEntity.ok(orderService.getOrderDetails(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable String id,
            @RequestParam OrderStatus status,
            @RequestParam(required = false) String note) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status, note));
    }

    @PostMapping("/{id}/details/{detailId}/assign-serials")
    public ResponseEntity<?> assignSerials(
            @PathVariable String id,
            @PathVariable String detailId,
            @RequestBody List<String> serialNumbers) {
        return ResponseEntity.ok(orderService.assignSerialsToDetail(id, detailId, serialNumbers));
    }
}
