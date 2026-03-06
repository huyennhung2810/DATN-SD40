package com.example.datn.core.admin.shiftTemplate.controller;


import com.example.datn.core.admin.shiftTemplate.model.request.ADShiftTemplateRequest;
import com.example.datn.core.admin.shiftTemplate.model.response.ADShiftTemplateResponse;
import com.example.datn.core.admin.shiftTemplate.service.ADShiftTemplateService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.MappingConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(MappingConstants.API_ADMIN_PREFIX_SHIFT_TEMPLATE)
@RequiredArgsConstructor
public class ADShiftTemplateController {

    private final ADShiftTemplateService service;

    @GetMapping
    public ResponseEntity<ResponseObject<List<ADShiftTemplateResponse>>> getAll() {
        List<ADShiftTemplateResponse> data = service.getAll();
        return ResponseEntity.ok(ResponseObject.success(data, "Lấy danh sách ca làm việc thành công"));
    }

    @PostMapping
    public ResponseEntity<ResponseObject<ADShiftTemplateResponse>> create(@RequestBody ADShiftTemplateRequest request) {
        ADShiftTemplateResponse data = service.create(request);
        return ResponseEntity.ok(ResponseObject.success(data, "Tạo ca làm việc mẫu thành công"));
    }
}
