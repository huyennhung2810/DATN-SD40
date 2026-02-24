package com.example.datn.core.admin.discountDetail.service;

import com.example.datn.core.admin.discountDetail.model.DiscountDetailResponse;
import com.example.datn.entity.Discount;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;


public interface DiscountDetailService {
    // Lấy danh sách sản phẩm theo ID của đợt giảm giá
    List<DiscountDetailResponse> getByIdDiscount(String idDiscount);

    // Lưu danh sách sản phẩm được chọn vào đợt giảm giá
    void saveAll(Discount discount, List<String> productDetailIds);
}
