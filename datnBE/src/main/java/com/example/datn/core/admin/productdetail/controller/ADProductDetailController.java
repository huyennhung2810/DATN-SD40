package com.example.datn.core.admin.productDetail.controller;


import com.example.datn.core.admin.productDetail.model.request.ADProductDetailRequest;
import com.example.datn.core.admin.productDetail.model.response.ADProductDetailResponse;
import com.example.datn.core.admin.productDetail.service.ADProductDetailService;
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
        }catch (Exception e) {
            System.out.println("===LỖI RỒI");
        }

        return ResponseEntity.ok(res);
    }

    @PutMapping("/{id}")
    public ResponseObject<?> updateProductDetail(@Valid @PathVariable String id, @RequestBody ADProductDetailRequest adProductDetailRequest) {
        return adProductDetailService.updateProductDetail(id, adProductDetailRequest);
    }
}

