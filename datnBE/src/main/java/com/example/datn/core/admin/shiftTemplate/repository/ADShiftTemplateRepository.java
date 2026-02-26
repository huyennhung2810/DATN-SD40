package com.example.datn.core.admin.shiftTemplate.repository;

import com.example.datn.entity.ShiftTemplate;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.repository.ShiftTemplateRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ADShiftTemplateRepository extends ShiftTemplateRepository {
    List<ShiftTemplate> findAllByStatus(EntityStatus status);
}
