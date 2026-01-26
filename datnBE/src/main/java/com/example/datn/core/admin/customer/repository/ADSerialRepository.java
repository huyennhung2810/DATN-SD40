package com.example.datn.core.admin.customer.repository;

import com.example.datn.entity.Serial;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.repository.SerialRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public interface ADSerialRepository extends SerialRepository {
    Page<Serial> getAllSerialsByProductDetailId(String productId, Pageable pageable);

    Page<Serial> findByStatusAndProductDetailId(String status, String productId, Pageable pageable);

    Page<Serial> findByStatus(String status, Pageable pageable);
}
