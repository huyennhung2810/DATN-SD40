package com.example.datn.core.admin.serial.repository;

import com.example.datn.entity.Serial;
import com.example.datn.infrastructure.constant.EntityStatus;
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
            "(:kw IS NULL OR :kw = '' OR s.serialNumber LIKE %:kw% OR s.code LIKE %:kw%) " +
            "AND (:sts IS NULL OR s.status = :sts) " +
            "AND (:pdId IS NULL OR s.productDetail.id = :pdId) " +
            "AND (:prodId IS NULL OR s.productDetail.product.id = :prodId) " +
            "AND (:catId IS NULL OR s.productDetail.product.productCategory.id = :catId) " +
            "ORDER BY s.createdDate DESC")
    List<Serial> searchSerials(
            @Param("kw") String keyword,
            @Param("sts") EntityStatus status,
            @Param("pdId") String productDetailId,
            @Param("prodId") String productId,
            @Param("catId") String productCategoryId
    );

    // Kiểm tra serial đã tồn tại trong biến thể khác (dùng cho update)
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM Serial s WHERE s.serialNumber = :serialNumber AND s.productDetail.id <> :productDetailId")
    boolean existsBySerialNumberAndProductDetailIdNot(@Param("serialNumber") String serialNumber, @Param("productDetailId") String productDetailId);

    // Xóa tất cả serial của một product detail
    void deleteByProductDetailId(String productDetailId);
}
