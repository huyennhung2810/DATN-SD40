package com.example.datn.core.admin.serial.repository;

import com.example.datn.entity.Serial;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.SerialStatus;
import com.example.datn.repository.SerialRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ADSerialRepository extends SerialRepository {

    Page<Serial> findByProductDetailId(String productId, Pageable pageable);

    // Lấy tất cả serial của một product detail
    List<Serial> findByProductDetailId(String productDetailId);

    boolean existsBySerialNumberIn(List<String> serialNumbers);

    // Kiểm tra serial đã tồn tại theo danh sách (trả về các serial đã tồn tại)
    @Query("SELECT s.serialNumber FROM Serial s WHERE s.serialNumber IN :serialNumbers")
    List<String> findExistingSerialNumbers(@Param("serialNumbers") List<String> serialNumbers);

    // Trong ADSerialRepository.java
    @Query("SELECT s FROM Serial s WHERE " +
            "(:keyword IS NULL OR s.serialNumber LIKE %:keyword% OR s.code LIKE %:keyword%) AND " +
            "(:status IS NULL OR s.status = :status) AND " +

            "(:serialStatus IS NULL OR s.serialStatus = :serialStatus) AND " +

            "(:productId IS NULL OR s.productDetail.product.id = :productId) AND " +
            "(:productCategoryId IS NULL OR s.productDetail.product.productCategory.id = :productCategoryId)")
    List<Serial> searchSerials(
            @Param("keyword") String keyword,
            @Param("status") EntityStatus status,
            @Param("serialStatus") SerialStatus serialStatus, // THÊM PARAM NÀY VÀO HÀM
            @Param("productId") String productId,
            @Param("productCategoryId") String productCategoryId);

    // Kiểm tra serial đã tồn tại trong biến thể khác (dùng cho update)
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM Serial s WHERE s.serialNumber = :serialNumber AND s.productDetail.id <> :productDetailId")
    boolean existsBySerialNumberAndProductDetailIdNot(@Param("serialNumber") String serialNumber, @Param("productDetailId") String productDetailId);

    // Xóa tất cả serial của một product detail
    void deleteByProductDetailId(String productDetailId);
}
