package com.example.datn.infrastructure.job.imei.repository;

import com.example.datn.entity.Serial;
import com.example.datn.repository.SerialRepository;

import java.util.List;

public interface SerialNumberExcelRepository extends SerialRepository {
    List<Serial> findByCodeIn(List<String> codes);
}
