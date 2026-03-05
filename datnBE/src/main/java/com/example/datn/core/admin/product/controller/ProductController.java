package com.example.datn.core.admin.product.controller;

import com.example.datn.core.admin.product.model.request.CustomerProductSearchRequest;
import com.example.datn.core.admin.product.model.response.ADProductResponse;
import com.example.datn.core.admin.product.service.CustomerProductService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.MappingConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(MappingConstants.API + "/products")
@RequiredArgsConstructor
public class ProductController {

    private final CustomerProductService productService;

    /**
     * Search products for customer with filters, sorting and pagination
     * Supports: name, category, price range (minPrice/maxPrice), TechSpec filters
     * Sorting: createdDate, price, name (asc/desc)
     *
     * @param request search parameters
     * @return paginated product list
     */
    @GetMapping
    public ResponseObject<PageableObject<ADProductResponse>> search(
            @ModelAttribute CustomerProductSearchRequest request) {
        return ResponseObject.<PageableObject<ADProductResponse>>builder()
                .isSuccess(true)
                .status(HttpStatus.OK)
                .data(productService.search(request))
                .message("Lấy danh sách sản phẩm thành công")
                .build();
    }

    /**
     * Get product details by ID
     *
     * @param id product ID
     * @return product details
     */
    @GetMapping("/{id}")
    public ResponseObject<ADProductResponse> findById(@PathVariable String id) {
        return ResponseObject.<ADProductResponse>builder()
                .isSuccess(true)
                .status(HttpStatus.OK)
                .data(productService.findById(id))
                .message("Lấy thông tin sản phẩm thành công")
                .build();
    }
}

