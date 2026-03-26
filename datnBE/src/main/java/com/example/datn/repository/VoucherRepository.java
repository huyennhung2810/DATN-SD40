package com.example.datn.repository;

import com.example.datn.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, String> {
    Optional<Voucher> findByCode(String code);

    List<Voucher> findAllByStatus(Integer status);

    // Vouchers actually active by date range, excluding force-stopped (status != 0)
    List<Voucher> findByStatusNotAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Integer status, Long startDate, Long endDate);
}
