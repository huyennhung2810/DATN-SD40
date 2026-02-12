package com.example.datn.core.admin.discount.repository;


import com.example.datn.core.admin.vouchers.model.request.ADVoucherSearchRequest;
import com.example.datn.entity.Discount;
import com.example.datn.repository.DiscountRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Pageable; // Đúng

import java.util.List;

@Repository
public interface ADDiscountRepository extends DiscountRepository {

    @Query(value = "SELECT d FROM Discount d WHERE " +
            "(:#{#req.keyword} IS NULL OR d.code LIKE %:#{#req.keyword}% OR d.name LIKE %:#{#req.keyword}%) " +
            "AND (:#{#req.status} IS NULL OR d.status = :#{#req.status}) " +
            "AND (:#{#req.startDate} IS NULL OR d.startDate >= :#{#req.startDate}) " +
            "AND (:#{#req.endDate} IS NULL OR d.endDate <= :#{#req.endDate}) " +
            "ORDER BY d.createdAt DESC")
    Page<Discount> findAllDiscount(@Param("req") ADVoucherSearchRequest req, Pageable pageable);
    // Kiểm tra trùng mã khi thêm mới
    boolean existsByCode(String code);

    // Kiểm tra trùng mã khi cập nhật (trừ chính nó ra)
    boolean existsByCodeAndIdNot(String code, String id);

    // Tìm các discount theo trạng thái và thời gian để Scheduler quét

    List<Discount> findAllByStatusAndStartDateBefore(Integer status, Long now);


    List<Discount> findAllByStatusAndEndDateBefore(Integer status, Long now);
}