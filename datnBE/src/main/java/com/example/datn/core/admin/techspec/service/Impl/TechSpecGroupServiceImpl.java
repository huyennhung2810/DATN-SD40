package com.example.datn.core.admin.techspec.service.Impl;

import com.example.datn.core.admin.techspec.model.request.TechSpecGroupRequest;
import com.example.datn.core.admin.techspec.model.request.TechSpecGroupSearchRequest;
import com.example.datn.core.admin.techspec.model.response.TechSpecGroupResponse;
import com.example.datn.core.admin.techspec.service.TechSpecGroupService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.entity.TechSpecGroup;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.repository.TechSpecGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TechSpecGroupServiceImpl implements TechSpecGroupService {

    private final TechSpecGroupRepository repository;

    @Override
    public PageableObject<TechSpecGroupResponse> search(TechSpecGroupSearchRequest request) {
        int page = request.getPage() > 0 ? request.getPage() - 1 : 0;
        PageRequest pageRequest = PageRequest.of(page, request.getSize());
        Page<TechSpecGroup> pageData = repository.search(
                request.getKeyword(),
                request.getStatus(),
                pageRequest
        );
        return new PageableObject<>(pageData.map(this::toResponse));
    }

    @Override
    @Transactional
    public TechSpecGroupResponse create(TechSpecGroupRequest request) {
        TechSpecGroup entity = new TechSpecGroup();
        mapRequestToEntity(request, entity);
        entity.setStatus(request.getStatus() != null ? request.getStatus() : EntityStatus.ACTIVE);
        return toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public TechSpecGroupResponse update(String id, TechSpecGroupRequest request) {
        TechSpecGroup entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhóm thông số kỹ thuật"));
        mapRequestToEntity(request, entity);
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }
        return toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String id) {
        TechSpecGroup entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhóm thông số kỹ thuật"));
        repository.delete(entity);
    }

    @Override
    public TechSpecGroupResponse findById(String id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhóm thông số kỹ thuật"));
    }

    private void mapRequestToEntity(TechSpecGroupRequest request, TechSpecGroup entity) {
        entity.setName(request.getName());
        entity.setCode(request.getCode());
        entity.setDescription(request.getDescription());
        entity.setDisplayOrder(request.getDisplayOrder());
    }

    private TechSpecGroupResponse toResponse(TechSpecGroup entity) {
        TechSpecGroupResponse response = new TechSpecGroupResponse();
        response.setId(entity.getId());
        response.setCode(entity.getCode());
        response.setName(entity.getName());
        response.setDescription(entity.getDescription());
        response.setDisplayOrder(entity.getDisplayOrder());
        response.setStatus(entity.getStatus());
        response.setCreatedAt(entity.getCreatedDate());
        response.setUpdatedAt(entity.getLastModifiedDate());
        return response;
    }
}
