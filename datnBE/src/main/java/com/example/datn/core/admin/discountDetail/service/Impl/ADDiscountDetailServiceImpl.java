package com.example.datn.core.admin.discountDetail.service.Impl;

import com.example.datn.core.admin.discount.repository.ADDiscountRepository;
import com.example.datn.core.admin.discountDetail.model.request.ADDiscountDetailRequest;
import com.example.datn.core.admin.discountDetail.repository.ADDiscountDetailRepository;
import com.example.datn.core.admin.discountDetail.service.ADDiscountDetailService;
import com.example.datn.core.common.base.PageableRequest;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.Discount;
import com.example.datn.entity.DiscountDetail;
import com.example.datn.entity.ProductDetail;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.repository.ProductDetailRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ADDiscountDetailServiceImpl implements ADDiscountDetailService {

    private final ADDiscountDetailRepository adDiscountDetailRepository;
    private final ADDiscountRepository adDiscountRepository;
    private final ProductDetailRepository productDetailRepository; // Giả định đã có

    @Transactional
    public ResponseObject<?> applyDiscountToProducts(ADDiscountDetailRequest request) {
        // 1. Lấy thông tin đợt giảm giá để biết % giảm
        Discount discount = adDiscountRepository.findById(request.getIdDiscount())
                .orElseThrow(() -> new RuntimeException("Đợt giảm giá không tồn tại"));

        List<DiscountDetail> savedDetails = new ArrayList<>();

        for (String pdId : request.getIdProductDetails()) {
            // 2. Lấy thông tin sản phẩm chi tiết
            ProductDetail pd = productDetailRepository.findById(pdId).orElse(null);
            if (pd == null) continue;

            // 3. Tính toán giá sau giảm
            BigDecimal priceBefore = pd.getSalePrice(); // Giả sử ProductDetail có trường price
            BigDecimal percent = discount.getDiscountPercent();
            // Công thức: priceAfter = priceBefore * (100 - percent) / 100
            BigDecimal priceAfter = priceBefore.multiply(BigDecimal.valueOf(100).subtract(percent))
                    .divide(BigDecimal.valueOf(100));

            // 4. Tạo bản ghi DiscountDetail
            DiscountDetail detail = new DiscountDetail();
            detail.setId(UUID.randomUUID().toString());
            detail.setDiscount(discount);
            detail.setProductDetail(pd);
            detail.setPriceBefore(priceBefore);
            detail.setPriceAfter(priceAfter);
            detail.setStatus(EntityStatus.ACTIVE);
            detail.setCreatedDate(System.currentTimeMillis());

            savedDetails.add(adDiscountDetailRepository.save(detail));
        }

        return ResponseObject.success(savedDetails, "Áp dụng giảm giá cho sản phẩm thành công");
    }

    @Override
    public ResponseObject<?> getProductsByDiscount(String discountId, PageableRequest request) {
        return null;
    }

    @Override
    public ResponseObject<?> removeProductFromDiscount(String id) {
        return null;
    }
}
