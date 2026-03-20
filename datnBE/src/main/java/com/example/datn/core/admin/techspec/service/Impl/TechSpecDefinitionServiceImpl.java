package com.example.datn.core.admin.techspec.service.Impl;

import com.example.datn.core.admin.techspec.model.request.TechSpecDefinitionRequest;
import com.example.datn.core.admin.techspec.model.request.TechSpecDefinitionSearchRequest;
import com.example.datn.core.admin.techspec.model.response.TechSpecDefinitionResponse;
import com.example.datn.core.admin.techspec.service.TechSpecDefinitionService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.entity.TechSpecDefinition;
import com.example.datn.entity.TechSpecGroup;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.repository.TechSpecDefinitionRepository;
import com.example.datn.repository.TechSpecGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TechSpecDefinitionServiceImpl implements TechSpecDefinitionService {

    private final TechSpecDefinitionRepository definitionRepository;
    private final TechSpecGroupRepository groupRepository;

    @Override
    public PageableObject<TechSpecDefinitionResponse> search(TechSpecDefinitionSearchRequest request) {
        int page = request.getPage() > 0 ? request.getPage() - 1 : 0;
        PageRequest pageRequest = PageRequest.of(page, request.getSize());
        Page<TechSpecDefinition> pageData = definitionRepository.search(
                request.getKeyword(),
                request.getGroupId(),
                request.getStatus(),
                request.getDataType(),
                pageRequest
        );
        return new PageableObject<>(pageData.map(this::toResponse));
    }

    @Override
    @Transactional
    public TechSpecDefinitionResponse create(TechSpecDefinitionRequest request) {
        TechSpecGroup group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhóm thông số"));

        TechSpecDefinition entity = new TechSpecDefinition();
        mapRequestToEntity(request, entity, group);
        entity.setStatus(request.getStatus() != null ? request.getStatus() : EntityStatus.ACTIVE);
        return toResponse(definitionRepository.save(entity));
    }

    @Override
    @Transactional
    public TechSpecDefinitionResponse update(String id, TechSpecDefinitionRequest request) {
        TechSpecDefinition entity = definitionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông số kỹ thuật"));

        TechSpecGroup group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhóm thông số"));

        mapRequestToEntity(request, entity, group);
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }
        return toResponse(definitionRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String id) {
        TechSpecDefinition entity = definitionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông số kỹ thuật"));
        definitionRepository.delete(entity);
    }

    @Override
    public TechSpecDefinitionResponse findById(String id) {
        return definitionRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông số kỹ thuật"));
    }

    @Override
    public List<TechSpecDefinitionResponse> getAllActiveDefinitions() {
        return definitionRepository.findAllActiveOrderByGroupAndOrder(EntityStatus.ACTIVE)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private void mapRequestToEntity(TechSpecDefinitionRequest request, TechSpecDefinition entity, TechSpecGroup group) {
        entity.setName(request.getName());
        entity.setCode(request.getCode());
        entity.setDescription(request.getDescription());
        entity.setTechSpecGroup(group);
        entity.setDataType(request.getDataType());
        entity.setUnit(request.getUnit());
        entity.setIsFilterable(request.getIsFilterable() != null ? request.getIsFilterable() : false);
        entity.setIsRequired(request.getIsRequired() != null ? request.getIsRequired() : false);
        entity.setDisplayOrder(request.getDisplayOrder());
    }

    private TechSpecDefinitionResponse toResponse(TechSpecDefinition entity) {
        TechSpecDefinitionResponse response = new TechSpecDefinitionResponse();
        response.setId(entity.getId());
        response.setCode(entity.getCode());
        response.setName(entity.getName());
        response.setDescription(entity.getDescription());
        response.setGroupId(entity.getTechSpecGroup() != null ? entity.getTechSpecGroup().getId() : null);
        response.setGroupName(entity.getTechSpecGroup() != null ? entity.getTechSpecGroup().getName() : null);
        response.setDataType(entity.getDataType());
        response.setUnit(entity.getUnit());
        response.setIsFilterable(entity.getIsFilterable());
        response.setIsRequired(entity.getIsRequired());
        response.setDisplayOrder(entity.getDisplayOrder());
        response.setStatus(entity.getStatus());
        response.setCreatedAt(entity.getCreatedDate());
        response.setUpdatedAt(entity.getLastModifiedDate());
        return response;
    }
}
