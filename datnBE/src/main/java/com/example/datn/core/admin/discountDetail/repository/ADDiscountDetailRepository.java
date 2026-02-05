package com.example.datn.core.admin.discountDetail.repository;

import com.example.datn.entity.DiscountDetail;
import com.example.datn.repository.DiscountDetailRepository;
import com.example.datn.repository.DiscountRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public interface ADDiscountDetailRepository extends DiscountDetailRepository {
    // Tìm tất cả sản phẩm thuộc một đợt giảm giá
    Page<DiscountDetail> findAllByDiscountId(String discountId, Pageable pageable);

    // Kiểm tra sản phẩm đã nằm trong đợt giảm giá này chưa
    boolean existsByDiscountIdAndProductDetailId(String discountId, String productDetailId);
}

