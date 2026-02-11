package com.example.datn.core.admin.storagecapacity.controller;


import com.example.datn.core.admin.storagecapacity.model.request.ADStorageCapacityRequest;
import com.example.datn.core.admin.storagecapacity.service.ADStorageCapacityService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.MappingConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(MappingConstants.API_ADMIN_PREFIX_PRODUCTS_STORAGE)
@RequiredArgsConstructor
@Slf4j
public class ADStorageCapacityController {

    private final ADStorageCapacityService adStorageCapacityService;

    @GetMapping
    public ResponseObject<?> getAllStorageCapacity() {
        return adStorageCapacityService.getAllStorageCapacity();
    }

    @GetMapping("/{code}")
    public ResponseObject<?> getStorageCapacityById(@PathVariable String code) {
        return adStorageCapacityService.getStorageCapacityByCode(code);
    }

    @PostMapping
    public ResponseObject<?> createStorageCapacity(@Valid @RequestBody ADStorageCapacityRequest request) {
        return adStorageCapacityService.createStorageCapacity(request);
    }

    @PutMapping("/{id}")
    public ResponseObject<?> updateStorageCapacity(@PathVariable String id, @Valid @RequestBody ADStorageCapacityRequest request) {
        return adStorageCapacityService.updateStorageCapacity(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseObject<?> deleteStorageCapacity(@PathVariable String id) {
        return adStorageCapacityService.deleteStorageCapacity(id);
    }
}
