package com.example.datn.core.admin.customer.controller;


import com.example.datn.core.admin.customer.model.request.ADCustomerRequest;
import com.example.datn.core.admin.customer.model.request.ADCustomerSearchRequest;
import com.example.datn.core.admin.customer.service.ADCustomerService;
import com.example.datn.infrastructure.constant.MappingConstants;
import com.example.datn.infrastructure.job.common.model.request.EXUploadRequest;
import com.example.datn.utils.Helper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(MappingConstants.API_ADMIN_PREFIX_CUSTOMERS)
@RequiredArgsConstructor
@Slf4j
public class ADCustomerController {

    private final ADCustomerService adCustomerService;

    @GetMapping
    public ResponseEntity<?> getAll(ADCustomerSearchRequest request) {
        return Helper.createResponseEntity(adCustomerService.getAllCustomer(request));
    }

    @GetMapping("/validation/duplicate")
    public ResponseEntity<?> checkDuplicate(
            @RequestParam(required = false) String identityCard,
            @RequestParam(required = false) String phoneNumber,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String id) {
        // Gọi Service xử lý logic kiểm tra trùng
        return ResponseEntity.ok(adCustomerService.checkDuplicate(identityCard, phoneNumber, email, id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable("id") String id) {
        return Helper.createResponseEntity(adCustomerService.getCustomerById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createCustomer(@Valid @ModelAttribute ADCustomerRequest request) {
        sanitizeRequest(request);
        return Helper.createResponseEntity(adCustomerService.addCustomer(request));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateCustomer(
            @PathVariable String id,
            @Valid @ModelAttribute ADCustomerRequest request
    ) {
        request.setId(id);
        sanitizeRequest(request);
        return Helper.createResponseEntity(adCustomerService.updateCustomer(request));
    }

    @PutMapping("/{id}/change-status")
    public ResponseEntity<?> changeStatus(@PathVariable("id") String id) {
        return Helper.createResponseEntity(adCustomerService.changeCustomerStatus(id));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> export() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=customers.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(adCustomerService.exportAllCustomers());
    }

    //Hỗ trợ xóa các giá trị undefined hoặc null từ fe gửi qua formdata
    private void sanitizeRequest(ADCustomerRequest request) {
        if ("undefined".equals(request.getIdentityCard()) || "null".equals(request.getIdentityCard())) {
            request.setIdentityCard(null);
        }
        if ("undefined".equals(request.getEmail()) || "null".equals(request.getEmail())) {
            request.setEmail(null);
        }
    }
}
