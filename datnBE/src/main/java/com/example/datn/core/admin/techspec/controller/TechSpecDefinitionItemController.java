package com.example.datn.core.admin.techspec.controller;

import com.example.datn.core.admin.techspec.model.request.TechSpecDefinitionItemRequest;
import com.example.datn.core.admin.techspec.model.response.TechSpecDefinitionItemResponse;
import com.example.datn.core.admin.techspec.service.TechSpecDefinitionItemService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.MappingConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(MappingConstants.ADMIN_TECH_SPEC_DEFINITION_ITEM)
@RequiredArgsConstructor
public class TechSpecDefinitionItemController {

    private final TechSpecDefinitionItemService service;

    @GetMapping("/definition/{definitionId}")
    public ResponseObject<List<TechSpecDefinitionItemResponse>> getByDefinition(
            @PathVariable String definitionId) {
        return ResponseObject.<List<TechSpecDefinitionItemResponse>>builder()
                .status(HttpStatus.OK)
                .data(service.getByDefinitionId(definitionId))
                .build();
    }

    @PostMapping
    public ResponseObject<TechSpecDefinitionItemResponse> create(
            @Valid @RequestBody TechSpecDefinitionItemRequest request) {
        return ResponseObject.<TechSpecDefinitionItemResponse>builder()
                .status(HttpStatus.CREATED)
                .data(service.create(request))
                .build();
    }

    @PutMapping("/{id}")
    public ResponseObject<TechSpecDefinitionItemResponse> update(
            @PathVariable String id,
            @Valid @RequestBody TechSpecDefinitionItemRequest request) {
        return ResponseObject.<TechSpecDefinitionItemResponse>builder()
                .status(HttpStatus.OK)
                .data(service.update(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ResponseObject<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseObject.<Void>builder()
                .status(HttpStatus.NO_CONTENT)
                .build();
    }

    @DeleteMapping("/definition/{definitionId}")
    public ResponseObject<Void> deleteByDefinition(@PathVariable String definitionId) {
        service.deleteByDefinitionId(definitionId);
        return ResponseObject.<Void>builder()
                .status(HttpStatus.NO_CONTENT)
                .build();
    }
}
