package com.example.datn.core.admin.serial.repository;

import com.example.datn.entity.Serial;
import com.example.datn.repository.SerialRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public interface ADSerialRepository extends SerialRepository {
    Page<Serial> getAllSerialsByProductDetailId(String productDetailId, Pageable pageable);

    Page<Serial> findByStatusAndProductDetailId(String status, String productId, Pageable pageable);

    Page<Serial> findByStatus(String status, Pageable pageable);

    Page<Serial> findByProductDetailId(String productId, Pageable pageable);
}
