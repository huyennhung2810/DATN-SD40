package com.example.datn.repository;

import com.example.datn.entity.Serial;
import com.example.datn.infrastructure.constant.SerialStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Set;

@Repository
public interface SerialRepository extends JpaRepository<Serial, String> {

    @Query("SELECT s.code FROM Serial s WHERE s.code IN :codes")
    Set<String> findByCodeIn(Collection<String> codes);

    boolean existsBySerialNumber(String serialNumber);

    java.util.Optional<Serial> findBySerialNumber(String serialNumber);

    java.util.List<Serial> findBySerialNumberIn(Collection<String> serialNumbers);

    // Lấy danh sách serial theo orderDetailId
    List<Serial> findByOrderDetail_Id(String orderDetailId);

    // Đếm số lượng serial theo orderDetailId
    long countByOrderDetail_Id(String orderDetailId);

    // Lấy danh sách serial theo orderDetailId và loại trừ serialNumber
    List<Serial> findByOrderDetail_IdAndSerialNumberNotIn(String orderDetailId, Collection<String> serialNumbers);

    // Lấy danh sách serial theo productDetailId và trạng thái
    List<Serial> findByProductDetailIdAndSerialStatus(String productDetailId, SerialStatus serialStatus);
}
