package com.example.datn.core.common.controller;

import com.example.datn.core.admin.product.model.request.CustomerProductSearchRequest;
import com.example.datn.core.admin.product.model.response.ADProductResponse;
import com.example.datn.core.admin.product.model.response.ADProductVariantResponse;
import com.example.datn.core.admin.product.service.CustomerProductService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.MappingConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Customer-facing Product Controller
 * Provides public endpoints for product listing and search
 */
@RestController
@RequestMapping(MappingConstants.API + "/public/products")
@RequiredArgsConstructor
public class CustomerProductController {

    private final CustomerProductService productService;

    /**
     * Search products for customer with filters, sorting and pagination
     * 
     * @param request search parameters including:
     *   - page, size: pagination
     *   - name: product name search
     *   - idProductCategory: filter by category
     *   - idTechSpec: filter by techspec
     *   - status: product status (default ACTIVE)
     *   - sensorType, lensMount, resolution, processor, imageFormat, videoFormat, iso: TechSpec filters
     *   - minPrice, maxPrice: price range filters
     *   - sortBy, orderBy: sorting (sortBy: createdDate, price, name; orderBy: asc, desc)
     * 
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

    /**
     * Get all variants (product details) for a product
     * 
     * @param id product ID
     * @return list of product variants with color, storage capacity, quantity, and price
     */
    @GetMapping("/{id}/variants")
    public ResponseObject<List<ADProductVariantResponse>> getVariants(@PathVariable String id) {
        return ResponseObject.<List<ADProductVariantResponse>>builder()
                .isSuccess(true)
                .status(HttpStatus.OK)
                .data(productService.getVariantsByProductId(id))
                .message("Lấy danh sách biến thể sản phẩm thành công")
                .build();
    }
}
