package com.example.datn.core.admin.techspec.controller;

import com.example.datn.core.admin.techspec.model.request.ResolutionRequest;
import com.example.datn.core.admin.techspec.model.request.ResolutionSearchRequest;
import com.example.datn.core.admin.techspec.model.response.ResolutionResponse;
import com.example.datn.core.admin.techspec.service.ResolutionService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.MappingConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(MappingConstants.ADMIN_TECH_SPEC + "/resolution")
@RequiredArgsConstructor
public class ResolutionController {

    private final ResolutionService service;

    @GetMapping
    public ResponseObject<PageableObject<ResolutionResponse>> search(
            @ModelAttribute ResolutionSearchRequest request) {
        return ResponseObject.<PageableObject<ResolutionResponse>>builder()
                .status(HttpStatus.OK)
                .data(service.search(request))
                .build();
    }

    @GetMapping("/{id}")
    public ResponseObject<ResolutionResponse> findById(@PathVariable String id) {
        return ResponseObject.<ResolutionResponse>builder()
                .status(HttpStatus.OK)
                .data(service.findById(id))
                .build();
    }

    @PostMapping
    public ResponseObject<ResolutionResponse> create(
            @Valid @RequestBody ResolutionRequest request) {
        return ResponseObject.<ResolutionResponse>builder()
                .status(HttpStatus.CREATED)
                .data(service.create(request))
                .build();
    }

    @PutMapping("/{id}")
    public ResponseObject<ResolutionResponse> update(
            @PathVariable String id,
            @Valid @RequestBody ResolutionRequest request) {
        return ResponseObject.<ResolutionResponse>builder()
                .status(HttpStatus.OK)
                .data(service.update(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ResponseObject<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseObject.<Void>builder()
                .status(HttpStatus.OK)
                .message("Xóa độ phân giải thành công")
                .build();
    }
}

