package com.example.datn.core.admin.techspec.service.Impl;

import com.example.datn.core.admin.techspec.model.request.TechSpecDefinitionItemRequest;
import com.example.datn.core.admin.techspec.model.response.TechSpecDefinitionItemResponse;
import com.example.datn.core.admin.techspec.service.TechSpecDefinitionItemService;
import com.example.datn.entity.TechSpecDefinition;
import com.example.datn.entity.TechSpecDefinitionItem;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.repository.TechSpecDefinitionItemRepository;
import com.example.datn.repository.TechSpecDefinitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TechSpecDefinitionItemServiceImpl implements TechSpecDefinitionItemService {

    private final TechSpecDefinitionItemRepository itemRepository;
    private final TechSpecDefinitionRepository definitionRepository;

    @Override
    public List<TechSpecDefinitionItemResponse> getByDefinitionId(String definitionId) {
        return itemRepository
                .findByTechSpecDefinitionIdOrderByDisplayOrderAsc(definitionId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TechSpecDefinitionItemResponse create(TechSpecDefinitionItemRequest request) {
        TechSpecDefinitionItem item = new TechSpecDefinitionItem();
        item.setName(request.getName() != null ? request.getName().trim() : null);
        item.setValue(request.getValue() != null ? request.getValue().trim() : null);
        item.setDisplayOrder(request.getDisplayOrder());

        TechSpecDefinition definition = definitionRepository
                .findById(request.getDefinitionId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông số kỹ thuật: " + request.getDefinitionId()));
        item.setTechSpecDefinition(definition);

        EntityStatus st = EntityStatus.ACTIVE;
        if (request.getStatus() != null) {
            try {
                st = EntityStatus.valueOf(request.getStatus());
            } catch (IllegalArgumentException ignored) {
            }
        }
        item.setStatus(st);

        return toResponse(itemRepository.save(item));
    }

    @Override
    @Transactional
    public TechSpecDefinitionItemResponse update(String id, TechSpecDefinitionItemRequest request) {
        TechSpecDefinitionItem item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giá trị: " + id));

        item.setName(request.getName() != null ? request.getName().trim() : null);
        item.setValue(request.getValue() != null ? request.getValue().trim() : null);
        item.setDisplayOrder(request.getDisplayOrder());

        if (request.getStatus() != null) {
            try {
                item.setStatus(EntityStatus.valueOf(request.getStatus()));
            } catch (IllegalArgumentException ignored) {
            }
        }

        return toResponse(itemRepository.save(item));
    }

    @Override
    @Transactional
    public void delete(String id) {
        itemRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteByDefinitionId(String definitionId) {
        itemRepository.deleteByTechSpecDefinitionId(definitionId);
    }

    private TechSpecDefinitionItemResponse toResponse(TechSpecDefinitionItem item) {
        TechSpecDefinitionItemResponse r = new TechSpecDefinitionItemResponse();
        r.setId(item.getId());
        r.setDefinitionId(item.getTechSpecDefinition() != null ? item.getTechSpecDefinition().getId() : null);
        r.setDefinitionCode(item.getTechSpecDefinition() != null ? item.getTechSpecDefinition().getCode() : null);
        r.setDefinitionName(item.getTechSpecDefinition() != null ? item.getTechSpecDefinition().getName() : null);
        r.setName(item.getName());
        r.setValue(item.getValue());
        r.setDisplayOrder(item.getDisplayOrder());
        r.setStatus(item.getStatus() != null ? item.getStatus().name() : null);
        r.setCreatedAt(item.getCreatedDate());
        r.setUpdatedAt(item.getLastModifiedDate());
        return r;
    }
}
