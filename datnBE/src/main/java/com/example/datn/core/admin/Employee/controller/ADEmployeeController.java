package com.example.datn.core.admin.Employee.controller;

import com.example.datn.core.admin.Employee.model.request.ADEmployeeRequest;
import com.example.datn.core.admin.Employee.model.request.ADEmployeeSearchRequest;
import com.example.datn.core.admin.Employee.service.ADEmployeeService;
import com.example.datn.infrastructure.constant.MappingConstants;
import com.example.datn.utils.Helper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(MappingConstants.API_ADMIN_PREFIX_EMPLOYEE)
@RequiredArgsConstructor
@Slf4j
public class ADEmployeeController {

    private final ADEmployeeService ademployeeService;

    @GetMapping
    public ResponseEntity<?> getAll(ADEmployeeSearchRequest request) {
        return Helper.createResponseEntity(ademployeeService.getAllEmployee(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable("id") String id) {
        return Helper.createResponseEntity(ademployeeService.getEmployeeById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addEmployee (@Valid @ModelAttribute ADEmployeeRequest request) {
        return Helper.createResponseEntity(ademployeeService.addEmployee(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable String id, @ModelAttribute ADEmployeeRequest request) {
        request.setId(id);
        return Helper.createResponseEntity(
                ademployeeService.updateEmployee(request)
        );
    }

    @PutMapping("/{id}/change-status")
    public ResponseEntity<?> changeStatus(@PathVariable("id") String id) {
        return Helper.createResponseEntity(ademployeeService.changeEmployeeStatus(id));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<?> changeRole(@PathVariable String id) {
        return ResponseEntity.ok(ademployeeService.changeEmployeeRole(id));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> export() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=customers.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(ademployeeService.exportAllEmployees());
    }

    @GetMapping("/validation/duplicate")
    public ResponseEntity<?> checkDuplicate(
            @RequestParam(required = false) String identityCard,
            @RequestParam(required = false) String phoneNumber,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String id) {
        return ResponseEntity.ok(ademployeeService.checkDuplicate(identityCard, phoneNumber, email, id, username));
    }
}
