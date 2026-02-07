package com.example.datn.core.admin.techspec.service.Impl;

import com.example.datn.core.admin.techspec.model.request.LensMountRequest;
import com.example.datn.core.admin.techspec.model.request.LensMountSearchRequest;
import com.example.datn.core.admin.techspec.model.response.LensMountResponse;
import com.example.datn.repository.LensMountRepository;
import com.example.datn.core.admin.techspec.service.LensMountService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.entity.LensMount;
import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LensMountServiceImpl implements LensMountService {

    private final LensMountRepository repository;

    @Override
    public PageableObject<LensMountResponse> search(LensMountSearchRequest request) {
        int page = request.getPage() > 0 ? request.getPage() - 1 : 0;
        PageRequest pageRequest = PageRequest.of(page, request.getSize());
        Page<LensMount> pageData = repository.search(
                request.getKeyword(),
                request.getStatus(),
                pageRequest
        );

        return new PageableObject<>(pageData.map(this::toResponse));
    }

    @Override
    @Transactional
    public LensMountResponse create(LensMountRequest request) {
        LensMount entity = new LensMount();
        mapRequestToEntity(request, entity);
        entity.setStatus(request.getStatus() != null ? request.getStatus() : EntityStatus.ACTIVE);

        return toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public LensMountResponse update(String id, LensMountRequest request) {
        LensMount entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ngàm lens"));

        mapRequestToEntity(request, entity);
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }

        return toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String id) {
        LensMount entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ngàm lens"));
        repository.delete(entity);
    }

    @Override
    public LensMountResponse findById(String id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ngàm lens"));
    }

    private void mapRequestToEntity(LensMountRequest request, LensMount entity) {
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
    }

    private LensMountResponse toResponse(LensMount entity) {
        LensMountResponse response = new LensMountResponse();
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

