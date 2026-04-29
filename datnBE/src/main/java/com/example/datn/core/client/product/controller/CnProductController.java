package com.example.datn.core.client.product.controller;

import com.example.datn.core.client.product.model.response.CnVariantResponse;
import com.example.datn.core.client.product.model.response.RelatedProductResponse;
import com.example.datn.core.client.product.service.CnProductService;
import com.example.datn.core.client.product.service.RelatedProductService;
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
    private final RelatedProductService relatedProductService;

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

    /**
     * Endpoint trả danh sách sản phẩm liên quan.
     *
     * @param id productId cần tìm sản phẩm liên quan
     * @param size số lượng kết quả (default 8, max 20)
     * @return List<RelatedProductResponse> đã sort theo similarity score giảm dần
     */
    @GetMapping("/{id}/related")
    public ResponseEntity<?> getRelatedProducts(
            @PathVariable("id") String id,
            @RequestParam(value = "size", defaultValue = "8") int size) {
        try {
            if (size <= 0) size = 8;
            if (size > 20) size = 20;
            List<RelatedProductResponse> related = relatedProductService.getRelatedProducts(id, size);
            return ResponseEntity.ok(related);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
