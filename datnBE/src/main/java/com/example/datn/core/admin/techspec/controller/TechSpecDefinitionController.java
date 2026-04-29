package com.example.datn.core.admin.techspec.controller;

import com.example.datn.core.admin.techspec.model.request.TechSpecDefinitionRequest;
import com.example.datn.core.admin.techspec.model.request.TechSpecDefinitionSearchRequest;
import com.example.datn.core.admin.techspec.model.response.TechSpecDefinitionResponse;
import com.example.datn.core.admin.techspec.service.TechSpecDefinitionService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.MappingConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(MappingConstants.ADMIN_TECH_SPEC_DEFINITION)
@RequiredArgsConstructor
public class TechSpecDefinitionController {

    private final TechSpecDefinitionService service;

    @GetMapping
    public ResponseObject<PageableObject<TechSpecDefinitionResponse>> search(
            @ModelAttribute TechSpecDefinitionSearchRequest request) {
        return ResponseObject.<PageableObject<TechSpecDefinitionResponse>>builder()
                .status(HttpStatus.OK)
                .data(service.search(request))
                .build();
    }

    @GetMapping("/all-active")
    public ResponseObject<List<TechSpecDefinitionResponse>> getAllActive() {
        return ResponseObject.<List<TechSpecDefinitionResponse>>builder()
                .status(HttpStatus.OK)
                .data(service.getAllActiveDefinitions())
                .build();
    }

    @GetMapping("/{id}")
    public ResponseObject<TechSpecDefinitionResponse> findById(@PathVariable String id) {
        return ResponseObject.<TechSpecDefinitionResponse>builder()
                .status(HttpStatus.OK)
                .data(service.findById(id))
                .build();
    }

    @PostMapping
    public ResponseObject<TechSpecDefinitionResponse> create(
            @Valid @RequestBody TechSpecDefinitionRequest request) {
        return ResponseObject.<TechSpecDefinitionResponse>builder()
                .status(HttpStatus.CREATED)
                .data(service.create(request))
                .build();
    }

    @PutMapping("/{id}")
    public ResponseObject<TechSpecDefinitionResponse> update(
            @PathVariable String id,
            @Valid @RequestBody TechSpecDefinitionRequest request) {
        return ResponseObject.<TechSpecDefinitionResponse>builder()
                .status(HttpStatus.OK)
                .data(service.update(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ResponseObject<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseObject.<Void>builder()
                .status(HttpStatus.OK)
                .message("Xóa thông số kỹ thuật thành công")
                .build();
    }
}
