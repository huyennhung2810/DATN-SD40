package com.example.datn.core.client.product.controller;

import com.example.datn.core.client.product.service.CnProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/client/product")
@RequiredArgsConstructor
@CrossOrigin("*")
public class CnProductController {

    private final CnProductService cnProductService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductDetail(@PathVariable("id") String id) {
        try {
            return ResponseEntity.ok(cnProductService.getProductDetailById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
