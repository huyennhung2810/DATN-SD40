package com.example.datn.core.admin.order.controller;

import com.example.datn.core.admin.order.model.request.*;
import com.example.datn.core.admin.order.service.ADOrderService;
import com.example.datn.utils.Helper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;


@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
public class ADOrderController {

    public final ADOrderService service;

    @GetMapping
    public ResponseEntity<?> getAll(@ModelAttribute ADOrderSearchRequest request) {
        return Helper.createResponseEntity(service.getAllHoaDon(request));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getHDCT(@ModelAttribute ADOrderDetailRequest request) {
        return Helper.createResponseEntity(service.getAllHoaDonCT(request));
    }

    @PutMapping("/change-status")
    public ResponseEntity<?> changeStatus(@RequestBody ADChangeStatusRequest adChangeStatusRequest) {
        return Helper.createResponseEntity(service.capNhatTrangThaiHoaDon(adChangeStatusRequest));
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamHoaDon() {
        SseEmitter emitter = new SseEmitter(600000L);
        emitter.onCompletion(() -> System.out.println("SSE Hoàn thành kết nối"));
        emitter.onTimeout(() -> System.out.println("SSE Hết hạn kết nối"));
        return emitter;
    }

    @PutMapping("/doi-imei")
    public ResponseEntity<?> doiImei(@RequestBody ADAssignSerialRequest request) {
        return Helper.createResponseEntity(service.doiImei(request));
    }

    @PutMapping("/cap-nhat-khach-hang")
    public ResponseEntity<?> capNhatKhachHang(
            @RequestBody ADUpdateCustomerRequest request) {
        return Helper.createResponseEntity(
                service.capNhatThongTinKhachHang(request)
        );
    }
}
