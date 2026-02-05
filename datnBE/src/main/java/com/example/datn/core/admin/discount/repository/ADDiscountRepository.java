package com.example.datn.core.admin.discount.repository;

import com.example.datn.entity.Discount;
import com.example.datn.repository.DiscountRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ADDiscountRepository extends DiscountRepository {
    @Query("""
       SELECT d FROM Discount d 
       WHERE (:keyword IS NULL OR d.code LIKE %:keyword% OR d.name LIKE %:keyword%)
       AND (:status IS NULL OR d.status = :status)
       AND (:start IS NULL OR d.startDate >= :start)
       AND (:end IS NULL OR d.endDate <= :end)
       ORDER BY d.createdDate DESC
       """)
    Page<Discount> getAllDiscounts(
            Pageable pageable,
            @Param("keyword") String keyword,
            @Param("status") Integer status,
            @Param("start") Long start,
            @Param("end") Long end
    );
    // 2. Thêm hàm này để kiểm tra trùng mã (Loại trừ ID hiện tại)
    boolean existsByCodeAndIdNot(String code, String id);
}
