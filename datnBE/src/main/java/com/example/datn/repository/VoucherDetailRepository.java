package com.example.datn.repository;

import com.example.datn.entity.Customer;
import com.example.datn.entity.Voucher;
import com.example.datn.entity.VoucherDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoucherDetailRepository extends JpaRepository<VoucherDetail, String> {

    // Tìm bằng String order id
    VoucherDetail findByOrder_Id(String orderId);

    // HOẶC tìm bằng nguyên Object Order
    // VoucherDetail findByOrder(Order order);
}
