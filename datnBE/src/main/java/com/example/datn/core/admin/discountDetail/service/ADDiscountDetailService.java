package com.example.datn.core.admin.discountDetail.service;

import com.example.datn.core.admin.discountDetail.model.request.ADDiscountDetailRequest;
import com.example.datn.core.common.base.PageableRequest;
import com.example.datn.core.common.base.ResponseObject;
import org.springframework.stereotype.Service;

@Service
public interface ADDiscountDetailService {
    // Áp dụng giảm giá cho danh sách sản phẩm
    ResponseObject<?> applyDiscountToProducts(ADDiscountDetailRequest request);

    // Lấy danh sách sản phẩm trong một đợt giảm giá (có phân trang)
    ResponseObject<?> getProductsByDiscount(String discountId, PageableRequest request);

    // Xóa sản phẩm khỏi đợt giảm giá
    ResponseObject<?> removeProductFromDiscount(String id);
}
