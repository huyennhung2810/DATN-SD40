package com.example.datn.core.admin.serial.repository;

import com.example.datn.core.admin.serial.model.response.ADSerialResponse;
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

    boolean existsBySerialNumberIn(List<String> serialNumbers);

    // Trong ADSerialRepository.java
    @Query("SELECT s FROM Serial s WHERE " +
            "(:kw IS NULL OR :kw = '' OR s.serialNumber LIKE %:kw% OR s.code LIKE %:kw%) " +
            "AND (:sts IS NULL OR s.status = :sts) " +
            "ORDER BY s.createdDate DESC")
    List<Serial> searchSerials(
            @Param("kw") String keyword,
            @Param("sts") EntityStatus status
    );
}
