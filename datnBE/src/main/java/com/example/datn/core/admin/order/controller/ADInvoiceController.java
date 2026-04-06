package com.example.datn.core.admin.order.controller;

import com.example.datn.core.admin.order.model.request.ADOrderDetailRequest;
import com.example.datn.core.admin.order.model.request.ADOrderSearchRequest;
import com.example.datn.core.admin.order.service.ADOrderService;
import com.example.datn.utils.Helper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Tra cứu hóa đơn (online + tại quầy). Không thay thế API thao tác vận hành đơn online
 * ({@link ADOrderController}).
 */
@RestController
@RequestMapping("/api/v1/admin/invoices")
@RequiredArgsConstructor
public class ADInvoiceController {

    private final ADOrderService orderService;

    @GetMapping
    public ResponseEntity<?> list(@ModelAttribute ADOrderSearchRequest request) {
        return Helper.createResponseEntity(orderService.getAllInvoices(request));
    }

    @GetMapping("/all")
    public ResponseEntity<?> detail(@ModelAttribute ADOrderDetailRequest request) {
        return Helper.createResponseEntity(orderService.getInvoiceDetail(request));
    }
}
