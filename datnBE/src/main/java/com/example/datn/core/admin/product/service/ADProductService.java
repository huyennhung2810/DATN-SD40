package com.example.datn.core.admin.product.service;

import com.example.datn.core.admin.product.model.request.ADProductRequest;
import com.example.datn.core.admin.product.model.request.ADProductSearchRequest;
import com.example.datn.core.admin.product.model.response.ADProductResponse;
import com.example.datn.core.admin.product.model.response.ADProductVariantResponse;
import com.example.datn.core.admin.product.model.response.ADProductWithVariantsResponse;
import com.example.datn.core.admin.productDetail.model.request.ADProductDetailRequest;
import com.example.datn.core.admin.productDetail.model.response.ADProductDetailResponse;
import com.example.datn.core.common.base.PageableObject;

public interface ADProductService {
    
    PageableObject<ADProductResponse> search(ADProductSearchRequest request);
    
    ADProductResponse create(ADProductRequest request);
    
    ADProductResponse update(String id, ADProductRequest request);
    
    void delete(String id);
    
    ADProductResponse findById(String id);

    // Lấy sản phẩm kèm danh sách biến thể con
    ADProductWithVariantsResponse getProductWithVariants(String id);

    // Thêm biến thể cho sản phẩm
    ADProductVariantResponse addVariant(String productId, ADProductDetailRequest request);

    // Cập nhật biến thể
    ADProductVariantResponse updateVariant(String variantId, ADProductDetailRequest request);

    // Cập nhật ảnh đại diện cho biến thể (lưu ngay khi chọn)
    ADProductVariantResponse updateVariantImage(String variantId, String selectedImageId);

    // Xóa biến thể
    void deleteVariant(String variantId);
}