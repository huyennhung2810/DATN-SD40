package com.example.datn.core.admin.voucherDetail.repository;

import com.example.datn.entity.VoucherDetail;
import com.example.datn.repository.VoucherDetailRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ADVoucherDetailRepository extends VoucherDetailRepository {
    // Tìm danh sách chi tiết voucher (khách hàng sở hữu) theo ID của Voucher gốc
    // Spring Data JPA sẽ tự động tạo câu lệnh: SELECT * FROM voucher_detail WHERE id_voucher = ?
    @Query("SELECT vd FROM VoucherDetail vd WHERE vd.voucher.id = :id")
    List<VoucherDetail> findAllByVoucherId2(@Param("id") String id);

    Page<VoucherDetail> findAllByVoucherId(String voucherId, Pageable pageable);
    // Kiểm tra xem khách hàng đã được gán voucher này chưa
    boolean existsByVoucherIdAndCustomerId(String voucherId, String customerId);

    @Query("""
           SELECT vd.customer.email 
           FROM VoucherDetail vd 
           WHERE vd.voucher.id = :voucherId 
           AND vd.isNotified = 0
           """)
    List<String> findEmailsByVoucherIdAndNotNotified(@Param("voucherId") String voucherId);

    @Query("""
           SELECT vd FROM VoucherDetail vd 
           WHERE vd.voucher.id = :voucherId 
           AND vd.customer.id IN :customerIds
           """)
    List<VoucherDetail> findAllByVoucherIdAndCustomerIds(
            @Param("voucherId") String voucherId,
            @Param("customerIds") List<String> customerIds
    );
    List<VoucherDetail> findByVoucherId(String voucherId);

    // Đếm số lượng khách hàng hợp lệ (chưa dùng voucher)
    int countByVoucherIdAndUsageStatus(String voucherId, int usageStatus);
    @Query("""
        SELECT v FROM VoucherDetail v
        WHERE v.voucher.id = :voucherId
          AND v.customer.id = :customerId
    """)
    Optional<VoucherDetail> findByVoucherIdAndCustomerId(
            @Param("voucherId") String voucherId,
            @Param("customerId") String customerId
    );



}

