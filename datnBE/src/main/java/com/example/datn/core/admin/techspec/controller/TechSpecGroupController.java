package com.example.datn.core.admin.techspec.controller;

import com.example.datn.core.admin.techspec.model.request.TechSpecGroupRequest;
import com.example.datn.core.admin.techspec.model.request.TechSpecGroupSearchRequest;
import com.example.datn.core.admin.techspec.model.response.TechSpecGroupResponse;
import com.example.datn.core.admin.techspec.service.TechSpecGroupService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.MappingConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(MappingConstants.ADMIN_TECH_SPEC_GROUP)
@RequiredArgsConstructor
public class TechSpecGroupController {

    private final TechSpecGroupService service;

    @GetMapping
    public ResponseObject<PageableObject<TechSpecGroupResponse>> search(
            @ModelAttribute TechSpecGroupSearchRequest request) {
        return ResponseObject.<PageableObject<TechSpecGroupResponse>>builder()
                .status(HttpStatus.OK)
                .data(service.search(request))
                .build();
    }

    @GetMapping("/{id}")
    public ResponseObject<TechSpecGroupResponse> findById(@PathVariable String id) {
        return ResponseObject.<TechSpecGroupResponse>builder()
                .status(HttpStatus.OK)
                .data(service.findById(id))
                .build();
    }

    @PostMapping
    public ResponseObject<TechSpecGroupResponse> create(
            @Valid @RequestBody TechSpecGroupRequest request) {
        return ResponseObject.<TechSpecGroupResponse>builder()
                .status(HttpStatus.CREATED)
                .data(service.create(request))
                .build();
    }

    @PutMapping("/{id}")
    public ResponseObject<TechSpecGroupResponse> update(
            @PathVariable String id,
            @Valid @RequestBody TechSpecGroupRequest request) {
        return ResponseObject.<TechSpecGroupResponse>builder()
                .status(HttpStatus.OK)
                .data(service.update(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ResponseObject<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseObject.<Void>builder()
                .status(HttpStatus.OK)
                .message("Xóa nhóm thông số kỹ thuật thành công")
                .build();
    }
}
