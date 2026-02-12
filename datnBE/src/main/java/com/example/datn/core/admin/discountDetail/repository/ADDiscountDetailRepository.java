package com.example.datn.core.admin.discountDetail.repository;

import com.example.datn.repository.DiscountDetailRepository;
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

    // 2. Xóa tất cả các sản phẩm cũ thuộc đợt giảm giá (Dùng khi cập nhật chương trình)
    @Modifying
    @Transactional
    @Query("DELETE FROM DiscountDetail dd WHERE dd.discount.id = :discountId")
    void deleteByDiscountId(@Param("discountId") String discountId);
    @Query("SELECT COUNT(dd) FROM DiscountDetail dd " +
            "JOIN dd.discount d " +
            "WHERE dd.productDetail.id = :productDetailId " +
            "AND d.status IN (0, 1) " + // Chỉ check các đợt Sắp chạy hoặc Đang chạy
            "AND d.id <> :currentDiscountId " + // Bỏ qua chính nó (dùng cho trường hợp Update)
            "AND (" +
            "   (:startDate BETWEEN d.startDate AND d.endDate) OR " +
            "   (:endDate BETWEEN d.startDate AND d.endDate) OR " +
            "   (d.startDate BETWEEN :startDate AND :endDate)" +
            ")")
    Long countConflictingDiscounts(@Param("productDetailId") String pdId,
                                   @Param("currentDiscountId") String discountId,
                                   @Param("startDate") Long start,
                                   @Param("endDate") Long end);
}
