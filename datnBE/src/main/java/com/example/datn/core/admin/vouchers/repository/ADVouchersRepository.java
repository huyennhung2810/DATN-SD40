package com.example.datn.core.admin.vouchers.repository;

import com.example.datn.entity.Voucher;
import com.example.datn.repository.VoucherRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ADVouchersRepository extends VoucherRepository {
    @Query(value = """
           SELECT v FROM Voucher v 
           WHERE (:keyword IS NULL OR v.code LIKE %:keyword% OR v.name LIKE %:keyword%)
           AND (:status IS NULL OR v.status = :status)
           AND (:type IS NULL OR v.voucherType = :type)
           AND (:start IS NULL OR v.startDate >= :start)
           AND (:end IS NULL OR v.endDate <= :end)
           ORDER BY v.LastModifiedDate DESC
           """)
    Page<Voucher> getAllVouchers(
            Pageable pageable,
            String keyword,
            Integer status,
            String type,
            Long start,
            Long end
    );
    // Kiểm tra mã 'code' đã tồn tại chưa, loại trừ bản ghi có 'id' này
    boolean existsByCodeAndIdNot(String code, String id);

    @Query("SELECT v FROM Voucher v LEFT JOIN FETCH v.details d LEFT JOIN FETCH d.customer WHERE v.id = :id")
    Optional<Voucher> findDetailById(@Param("id") String id);

    // Nếu bạn muốn kiểm tra trùng mã khi tạo mới (chưa có ID)
    boolean existsByCode(String code);

    List<Voucher> findAllByStatusAndStartDateBefore(Integer status, Long now);

    // Tìm các voucher cần chuyển sang "Đã kết thúc"
    List<Voucher> findAllByStatusAndEndDateBefore(Integer status, Long now);

    @Query("""
       SELECT v FROM Voucher v
       WHERE v.status != 0
       """)
    List<Voucher> findAllActiveVoucher();

    @Modifying
    @Transactional
    @Query("""
        update Voucher v 
        set v.status = :status
        where v.status != 0
        and v.startDate > :now
    """)
    void updateSapDienRa(@Param("status") Integer status, @Param("now") Long now);

    @Modifying
    @Transactional
    @Query("""
        update Voucher v
        set v.status = :status
        where v.status != 0
        and v.startDate <= :now
        and v.endDate >= :now
    """)
    void updateDangDienRa(@Param("status") Integer status, @Param("now") Long now);

    @Modifying
    @Transactional
    @Query("""
        update Voucher v
        set v.status = :status
        where v.status != 0
        and v.endDate < :now
    """)
    void updateDaKetThuc(@Param("status") Integer status, @Param("now") Long now);

}
