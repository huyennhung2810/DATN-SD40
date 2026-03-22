package com.example.datn.core.admin.discountDetail.service.Impl;

import com.example.datn.core.admin.discountDetail.model.ADDiscountProductDetailResponse;
import com.example.datn.core.admin.discountDetail.repository.ADProductDetailForDiscountRepository;
import com.example.datn.core.admin.discountDetail.service.ProductDetailForDiscountService;
import com.example.datn.entity.ProductDetail;
import com.example.datn.repository.ProductDetailRepository;
import com.example.datn.utils.Helper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ProductDetailForDiscountServiceImpl implements ProductDetailForDiscountService {

    @Autowired
    private ADProductDetailForDiscountRepository adProductDetailForDiscountRepository;

    @Override
    public Page<ADDiscountProductDetailResponse> getAll(String keyword, Pageable pageable) {
        // 1. Lấy ra Page<ProductDetail> (Entity) từ Repository
        Page<ProductDetail> entityPage = adProductDetailForDiscountRepository.searchByKeyword(keyword, pageable);

        // 2. Map Entity sang DTO ngay trên đối tượng Page
        Page<ADDiscountProductDetailResponse> dtoPage = entityPage.map(entity ->
                ADDiscountProductDetailResponse.builder()
                        .id(entity.getId())
                        .code(entity.getCode())
                        .note(entity.getNote())
                        .version(entity.getVersion())
                        .quantity(entity.getQuantity())
                        .salePrice(entity.getSalePrice())
                        .status(entity.getStatus())
                        // Lấy các thông tin liên quan
                        .colorName(entity.getColor() != null ? entity.getColor().getName() : null)
                        .productName(entity.getProduct() != null ? entity.getProduct().getName() : null)
                        .storageCapacityName(entity.getStorageCapacity() != null ? entity.getStorageCapacity().getName() : null)
                        .creationDate(Helper.formatDate(entity.getCreatedDate()))
                        .build()
        );

        // 3. Trả về Page chứa DTO
        return dtoPage;
    }
}