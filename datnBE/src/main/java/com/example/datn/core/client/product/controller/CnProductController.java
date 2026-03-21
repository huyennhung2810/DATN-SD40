package com.example.datn.core.client.product.controller;

import com.example.datn.core.client.product.model.response.CnVariantResponse;
import com.example.datn.core.client.product.service.CnProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("/{id}/variants")
    public ResponseEntity<?> getVariants(@PathVariable("id") String id) {
        try {
            List<CnVariantResponse> variants = cnProductService.getVariantsByProductId(id);
            return ResponseEntity.ok(variants);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
