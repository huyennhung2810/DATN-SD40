package com.example.datn.core.admin.color.controller;

import com.example.datn.core.admin.color.model.request.ADColorRequest;
import com.example.datn.core.admin.color.service.ADColorService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.MappingConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(MappingConstants.API_ADMIN_PREFIX_PRODUCTS_COLOR)
@RequiredArgsConstructor
@Slf4j
public class ADColorController {

    private final ADColorService adColorService;

    @GetMapping
    public ResponseObject<?> getAllColors() {
        return adColorService.getAllColors();
    }

    @GetMapping("/{code}")
    public ResponseObject<?> getColorById(@PathVariable String code) {
        return adColorService.getColorByCode(code);
    }

    @PostMapping
    public ResponseObject<?> createColor(@Valid @RequestBody ADColorRequest request) {
        return adColorService.createColor(request);
    }

    @PostMapping("/{id}")
    public ResponseObject<?> updateColor(@PathVariable String id, @Valid @RequestBody ADColorRequest request) {
        return adColorService.updateColor(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseObject<?> deleteColor(@PathVariable String id) {
        return adColorService.deleteColor(id);
    }
}
