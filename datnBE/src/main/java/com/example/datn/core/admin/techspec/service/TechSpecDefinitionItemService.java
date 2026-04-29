package com.example.datn.core.admin.techspec.service;

import com.example.datn.core.admin.techspec.model.request.TechSpecDefinitionItemRequest;
import com.example.datn.core.admin.techspec.model.response.TechSpecDefinitionItemResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TechSpecDefinitionItemService {

    List<TechSpecDefinitionItemResponse> getByDefinitionId(String definitionId);

    TechSpecDefinitionItemResponse create(TechSpecDefinitionItemRequest request);

    TechSpecDefinitionItemResponse update(String id, TechSpecDefinitionItemRequest request);

    void delete(String id);

    void deleteByDefinitionId(String definitionId);
}
