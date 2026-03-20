package com.example.datn.core.admin.techspec.service;

import com.example.datn.core.admin.techspec.model.request.TechSpecDefinitionRequest;
import com.example.datn.core.admin.techspec.model.request.TechSpecDefinitionSearchRequest;
import com.example.datn.core.admin.techspec.model.response.TechSpecDefinitionResponse;
import com.example.datn.core.common.base.PageableObject;

import java.util.List;

public interface TechSpecDefinitionService {

    PageableObject<TechSpecDefinitionResponse> search(TechSpecDefinitionSearchRequest request);

    TechSpecDefinitionResponse create(TechSpecDefinitionRequest request);

    TechSpecDefinitionResponse update(String id, TechSpecDefinitionRequest request);

    void delete(String id);

    TechSpecDefinitionResponse findById(String id);

    List<TechSpecDefinitionResponse> getAllActiveDefinitions();
}
