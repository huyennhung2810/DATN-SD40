package com.example.datn.core.admin.discountDetail.repository;

import com.example.datn.entity.DiscountDetail;
import com.example.datn.repository.DiscountDetailRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ADDiscountDetailRepository extends DiscountDetailRepository {
    // 1. Lấy danh sách sản phẩm áp dụng theo ID đợt giảm giá
    @Query("SELECT dd FROM DiscountDetail dd WHERE dd.discount.id = :discountId")
    List<DiscountDetail> findAllByDiscountId(@Param("discountId") String discountId);

    // 2. Xóa tất cả các sản phẩm cũ thuộc đợt giảm giá (Dùng khi cập nhật chương
    // trình)
    @Modifying
    @Transactional
    @Query("DELETE FROM DiscountDetail dd WHERE dd.discount.id = :discountId")
    void deleteByDiscountId(@Param("discountId") String discountId);

    @Query("""
                SELECT COUNT(dd) FROM DiscountDetail dd
                WHERE dd.productDetail.id IN :pdIds
                AND dd.discount.id != :currentId
                AND dd.discount.status IN (1, 2)
                AND dd.discount.startDate <= :endDate
                AND dd.discount.endDate >= :startDate
            """)
    Long countConflicts(
            @Param("pdIds") List<String> pdIds,
            @Param("currentId") String currentId,
            @Param("startDate") Long startDate,
            @Param("endDate") Long endDate);

    @Query("""
                SELECT dd FROM DiscountDetail dd
                WHERE dd.productDetail.id = :productDetailId
                AND dd.discount.status = 2
                AND dd.discount.quantity > 0
                AND dd.discount.startDate <= :now
                AND dd.discount.endDate >= :now
            """)
    java.util.Optional<com.example.datn.entity.DiscountDetail> findActiveByProductDetailId(
            @Param("productDetailId") String productDetailId,
            @Param("now") Long now);

    /**
     * Đợt giảm giá đang active cho từng {@code productDetailId}.
     * Mỗi dòng:
     * {@code [productDetailId, discountPercent, priceAfter, priceBefore]}.
     * <p>
     * Client tính giá đỏ từ {@code discountPercent} × giá niêm yết <i>hiện tại</i>;
     * các cột snapshot
     * chỉ dùng khi không có % hoặc để đối chiếu (xem
     * {@link com.example.datn.core.client.product.service.ProductPricingRules}).
     * <p>
     * <b>Lưu ý:</b> Query kiểm tra {@code discount.quantity > 0} để đảm bảo
     * không hiển thị giảm giá khi số lượng đợt giảm giá đã hết.
     */
    @Query("""
            SELECT dd.productDetail.id, dd.discount.discountPercent, dd.priceAfter, dd.priceBefore FROM DiscountDetail dd
            WHERE dd.productDetail.id IN :productDetailIds
            AND dd.discount.status = 2
            AND dd.discount.quantity > 0
            AND dd.discount.startDate <= :now
            AND dd.discount.endDate >= :now
            """)
    List<Object[]> findActiveDiscountsByProductDetailIds(
            @Param("productDetailIds") List<String> productDetailIds,
            @Param("now") Long now);
}
