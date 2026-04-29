package com.example.datn.core.admin.discountDetail.repository;

import com.example.datn.repository.ProductDetailRepository;
import com.example.datn.entity.ProductDetail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ADProductDetailForDiscountRepository extends ProductDetailRepository {
    @Query("SELECT pd FROM ProductDetail pd " +
            "LEFT JOIN pd.product p " +
            "WHERE pd.status = 0 " + // Chỉ lấy sản phẩm đang bán

            // DÙNG NOT EXISTS THAY CHO NOT IN (An toàn và chuẩn xác 100%)
            "AND NOT EXISTS (" +
            "    SELECT 1 FROM DiscountDetail dd " +
            "    JOIN dd.discount d " +
            "    WHERE dd.productDetail.id = pd.id " + // Nối sản phẩm hiện tại với chi tiết giảm giá
            "    AND d.status = 2 " + // CHÚ Ý: Đảm bảo 1 là trạng thái Active trong DB của bạn
            "    AND (:currentDiscountId IS NULL OR d.id != :currentDiscountId)" +
            ") " +

            // Điều kiện Search
            "AND (:keyword IS NULL OR :keyword = '' OR " +
            "lower(p.name) LIKE lower(concat('%', :keyword, '%')) OR " +
            "lower(pd.code) LIKE lower(concat('%', :keyword, '%')))")
    Page<ProductDetail> searchByKeyword(
            @Param("keyword") String keyword,
            @Param("currentDiscountId") String currentDiscountId,
            Pageable pageable
    );
}