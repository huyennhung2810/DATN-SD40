package com.example.datn.core.admin.voucherDetail.repository;

import com.example.datn.entity.VoucherDetail;
import com.example.datn.repository.VoucherDetailRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public interface ADVoucherDetailRepository extends VoucherDetailRepository {
    // Tìm danh sách chi tiết voucher (khách hàng sở hữu) theo ID của Voucher gốc
    // Spring Data JPA sẽ tự động tạo câu lệnh: SELECT * FROM voucher_detail WHERE id_voucher = ?
    Page<VoucherDetail> findAllByVoucherId(String voucherId, Pageable pageable);

    // Kiểm tra xem khách hàng đã được gán voucher này chưa
    boolean existsByVoucherIdAndCustomerId(String voucherId, String customerId);
}

