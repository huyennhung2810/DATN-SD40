package com.example.datn.core.admin.techspec.service.Impl;

import com.example.datn.core.admin.techspec.model.request.ResolutionRequest;
import com.example.datn.core.admin.techspec.model.request.ResolutionSearchRequest;
import com.example.datn.core.admin.techspec.model.response.ResolutionResponse;
import com.example.datn.repository.ResolutionRepository;
import com.example.datn.core.admin.techspec.service.ResolutionService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.entity.Resolution;
import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ResolutionServiceImpl implements ResolutionService {

    private final ResolutionRepository repository;

    @Override
    public PageableObject<ResolutionResponse> search(ResolutionSearchRequest request) {
        int page = request.getPage() > 0 ? request.getPage() - 1 : 0;
        PageRequest pageRequest = PageRequest.of(page, request.getSize());
        Page<Resolution> pageData = repository.search(
                request.getKeyword(),
                request.getStatus(),
                pageRequest
        );

        return new PageableObject<>(pageData.map(this::toResponse));
    }

    @Override
    @Transactional
    public ResolutionResponse create(ResolutionRequest request) {
        Resolution entity = new Resolution();
        mapRequestToEntity(request, entity);
        entity.setStatus(request.getStatus() != null ? request.getStatus() : EntityStatus.ACTIVE);

        return toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public ResolutionResponse update(String id, ResolutionRequest request) {
        Resolution entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy độ phân giải"));

        mapRequestToEntity(request, entity);
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }

        return toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String id) {
        Resolution entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy độ phân giải"));
        repository.delete(entity);
    }

    @Override
    public ResolutionResponse findById(String id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy độ phân giải"));
    }

    private void mapRequestToEntity(ResolutionRequest request, Resolution entity) {
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
    }

    private ResolutionResponse toResponse(Resolution entity) {
        ResolutionResponse response = new ResolutionResponse();
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

