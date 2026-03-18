package com.example.datn.core.admin.brand.service.Impl;

import com.example.datn.core.admin.brand.model.request.ADBrandRequest;
import com.example.datn.core.admin.brand.model.request.ADBrandSearchRequest;
import com.example.datn.core.admin.brand.model.response.ADBrandResponse;
import com.example.datn.core.admin.brand.repository.ADBrandRepository;
import com.example.datn.core.admin.brand.service.ADBrandService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.entity.Brand;
import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ADBrandServiceImpl implements ADBrandService {

    private final ADBrandRepository repository;

    @Override
    public PageableObject<ADBrandResponse> search(ADBrandSearchRequest request) {
        int page = request.getPage() > 0 ? request.getPage() - 1 : 0;
        PageRequest pageRequest = PageRequest.of(page, request.getSize());
        Page<Brand> pageData = repository.search(
                request.getKeyword(),
                request.getStatus(),
                pageRequest
        );

        return new PageableObject<>(pageData.map(this::toResponse));
    }

    @Override
    @Transactional
    public ADBrandResponse create(ADBrandRequest request) {
        if (repository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Mã thương hiệu đã tồn tại");
        }

        Brand entity = new Brand();
        entity.setName(request.getName());
        entity.setCode(request.getCode());
        entity.setDescription(request.getDescription());
        entity.setStatus(request.getStatus() != null ? request.getStatus() : EntityStatus.ACTIVE);

        return toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public ADBrandResponse update(String id, ADBrandRequest request) {
        Brand entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thương hiệu"));

        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }

        return toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String id) {
        Brand entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thương hiệu"));
        repository.delete(entity);
    }

    @Override
    public ADBrandResponse findById(String id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thương hiệu"));
    }

    private ADBrandResponse toResponse(Brand entity) {
        ADBrandResponse response = new ADBrandResponse();
        response.setId(entity.getId());
        response.setCode(entity.getCode());
        response.setName(entity.getName());
        response.setDescription(entity.getDescription());
        response.setStatus(entity.getStatus());

        if (entity.getCreatedDate() != null) {
            response.setCreatedAt(entity.getCreatedDate());
        }
        if (entity.getLastModifiedDate() != null) {
            response.setUpdatedAt(entity.getLastModifiedDate());
        }
        return response;
    }
}
