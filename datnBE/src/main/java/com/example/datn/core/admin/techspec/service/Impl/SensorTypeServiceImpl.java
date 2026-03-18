package com.example.datn.core.admin.techspec.service.Impl;

import com.example.datn.core.admin.techspec.model.request.SensorTypeRequest;
import com.example.datn.core.admin.techspec.model.request.SensorTypeSearchRequest;
import com.example.datn.core.admin.techspec.model.response.SensorTypeResponse;
import com.example.datn.repository.SensorTypeRepository;
import com.example.datn.core.admin.techspec.service.SensorTypeService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.entity.SensorType;
import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SensorTypeServiceImpl implements SensorTypeService {

    private final SensorTypeRepository repository;

    @Override
    public PageableObject<SensorTypeResponse> search(SensorTypeSearchRequest request) {
        int page = request.getPage() > 0 ? request.getPage() - 1 : 0;
        PageRequest pageRequest = PageRequest.of(page, request.getSize());
        Page<SensorType> pageData = repository.search(
                request.getKeyword(),
                request.getStatus(),
                pageRequest
        );

        return new PageableObject<>(pageData.map(this::toResponse));
    }

    @Override
    @Transactional
    public SensorTypeResponse create(SensorTypeRequest request) {
        SensorType entity = new SensorType();
        mapRequestToEntity(request, entity);
        entity.setStatus(request.getStatus() != null ? request.getStatus() : EntityStatus.ACTIVE);

        return toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public SensorTypeResponse update(String id, SensorTypeRequest request) {
        SensorType entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy loại cảm biến"));

        mapRequestToEntity(request, entity);
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }

        return toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String id) {
        SensorType entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy loại cảm biến"));
        repository.delete(entity);
    }

    @Override
    public SensorTypeResponse findById(String id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy loại cảm biến"));
    }

    private void mapRequestToEntity(SensorTypeRequest request, SensorType entity) {
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
    }

    private SensorTypeResponse toResponse(SensorType entity) {
        SensorTypeResponse response = new SensorTypeResponse();
        response.setId(entity.getId());
        response.setName(entity.getName());
        response.setDescription(entity.getDescription());
        response.setCode(entity.getCode());
        response.setStatus(entity.getStatus());
        response.setCreatedAt(entity.getCreatedDate());
        response.setUpdatedAt(entity.getLastModifiedDate());
        return response;
    }
}

