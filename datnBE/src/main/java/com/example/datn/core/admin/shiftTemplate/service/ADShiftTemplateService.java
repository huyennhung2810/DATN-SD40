package com.example.datn.core.admin.shiftTemplate.service;

import com.example.datn.core.admin.shiftTemplate.model.request.ADShiftTemplateRequest;
import com.example.datn.core.admin.shiftTemplate.model.response.ADShiftTemplateResponse;
import com.example.datn.core.admin.shiftTemplate.repository.ADShiftTemplateRepository;
import com.example.datn.entity.ShiftTemplate;
import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ADShiftTemplateService {
    private final ADShiftTemplateRepository repository;

    public List<ADShiftTemplateResponse> getAll(String keyword, EntityStatus status, LocalTime startTime, LocalTime endTime) {
        // Sử dụng câu Query searchShifts bạn đã viết trong Repository
        return repository.searchShifts(keyword, status, startTime, endTime)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ADShiftTemplateResponse create(ADShiftTemplateRequest request) {
        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new RuntimeException("Giờ bắt đầu phải trước giờ kết thúc");
        }

        ShiftTemplate shift = new ShiftTemplate();
        shift.setName(request.getName());
        shift.setStartTime(request.getStartTime());
        shift.setEndTime(request.getEndTime());
        shift.setStatus(EntityStatus.ACTIVE);

        ShiftTemplate saved = repository.save(shift);
        return mapToResponse(saved);
    }

    public ADShiftTemplateResponse changeStatus(String id) {
        // 1. Tìm ca làm việc, nếu không thấy thì báo lỗi
        ShiftTemplate shift = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ca làm việc này"));

        // 2. Logic đảo trạng thái (Toggle)
        if (shift.getStatus() == EntityStatus.ACTIVE) {
            shift.setStatus(EntityStatus.INACTIVE);
        } else {
            shift.setStatus(EntityStatus.ACTIVE);
        }

        // 3. Lưu lại và trả về response
        ShiftTemplate saved = repository.save(shift);
        return mapToResponse(saved);
    }

    private ADShiftTemplateResponse mapToResponse(ShiftTemplate entity) {
        ADShiftTemplateResponse response = new ADShiftTemplateResponse();
        response.setId(entity.getId());
        response.setCode(entity.getCode());
        response.setName(entity.getName());
        response.setStartTime(entity.getStartTime());
        response.setEndTime(entity.getEndTime());
        response.setStatus(entity.getStatus().name());
        response.setIsActive(entity.getStatus() == EntityStatus.ACTIVE);
        return response;
    }
}
