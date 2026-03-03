package com.example.datn.core.admin.product.service;

import com.example.datn.core.admin.product.model.request.CustomerProductSearchRequest;
import com.example.datn.core.admin.product.model.response.ADProductResponse;
import com.example.datn.core.common.base.PageableObject;

public interface CustomerProductService {
    
    /**
     * Search products for customer with filters, sorting and pagination
     * @param request search parameters
     * @return paginated product list
     */
    PageableObject<ADProductResponse> search(CustomerProductSearchRequest request);
    
    /**
     * Get product by ID for customer
     * @param id product ID
     * @return product details
     */
    ADProductResponse findById(String id);
}


