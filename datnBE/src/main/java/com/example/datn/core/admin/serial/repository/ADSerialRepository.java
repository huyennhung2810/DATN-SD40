package com.example.datn.core.admin.serial.repository;

import com.example.datn.core.admin.serial.model.response.ADSerialResponse;
import com.example.datn.entity.Serial;
import com.example.datn.repository.SerialRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ADSerialRepository extends SerialRepository {
    Page<Serial> getAllSerialsByProductDetailId(String productDetailId, Pageable pageable);


    Page<Serial> findByStatus(String status, Pageable pageable);

    Page<Serial> findByProductDetailId(String productId, Pageable pageable);

    @Query("SELECT s FROM Serial s ORDER BY s.createdDate DESC")
    List<Serial> getAllSorted();
}
