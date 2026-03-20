package com.example.datn.core.admin.productdetail.controller;

import com.example.datn.core.admin.productdetail.model.request.ADProductDetailRequest;
import com.example.datn.core.admin.productdetail.model.response.ADProductDetailResponse;
import com.example.datn.core.admin.productdetail.service.ADProductDetailService;

import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.MappingConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(MappingConstants.API_ADMIN_PREFIX_PRODUCTS_DETAIL)
@RequiredArgsConstructor
@Slf4j
public class ADProductDetailController {

    private final ADProductDetailService adProductDetailService;

    @GetMapping
    public ResponseObject<?> getAllProductDetails(String keyword, EntityStatus status) {
        return adProductDetailService.getAllProductDetails(keyword, status);
    }

    @GetMapping("/{id}")
    public ResponseObject<?> getProductDetailById(@PathVariable String id) {
        return adProductDetailService.getById(id);
    }

    @PostMapping
    public ResponseEntity<ResponseObject<ADProductDetailResponse>> add(@RequestBody ADProductDetailRequest request) {
        ResponseObject<ADProductDetailResponse> res = new ResponseObject<>();
        try {
            ADProductDetailResponse response = adProductDetailService.addProductDetail(request);
            res.setStatus(HttpStatus.OK);
            res.setMessage("Thêm mới sản phẩm chi tiết thành công!");
            res.setData(response);
            res.setSuccess(true);
        } catch (RuntimeException e) {
            res.setStatus(HttpStatus.BAD_REQUEST);
            res.setMessage(e.getMessage());
            res.setSuccess(false);
            return ResponseEntity.badRequest().body(res);
        } catch (Exception e) {
            res.setStatus(HttpStatus.INTERNAL_SERVER_ERROR);
            res.setMessage("Lỗi khi thêm sản phẩm chi tiết: " + e.getMessage());
            res.setSuccess(false);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
        }

        return ResponseEntity.ok(res);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseObject<ADProductDetailResponse>> updateProductDetail(
            @PathVariable String id,
            @RequestBody ADProductDetailRequest request) {
        ResponseObject<ADProductDetailResponse> res = new ResponseObject<>();
        try {
            @SuppressWarnings("unchecked")
            ResponseObject<ADProductDetailResponse> response = (ResponseObject<ADProductDetailResponse>) adProductDetailService.updateProductDetail(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            res.setStatus(HttpStatus.BAD_REQUEST);
            res.setMessage(e.getMessage());
            res.setSuccess(false);
            return ResponseEntity.badRequest().body(res);
        } catch (Exception e) {
            res.setStatus(HttpStatus.INTERNAL_SERVER_ERROR);
            res.setMessage("Lỗi khi cập nhật sản phẩm chi tiết: " + e.getMessage());
            res.setSuccess(false);
            log.error("Error updating product detail", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
        }
    }
}

