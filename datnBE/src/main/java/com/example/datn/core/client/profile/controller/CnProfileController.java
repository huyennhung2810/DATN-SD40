package com.example.datn.core.client.profile.controller;

import com.example.datn.core.admin.customer.model.request.ADCustomerRequest;
import com.example.datn.core.admin.customer.service.ADCustomerService;
import com.example.datn.utils.Helper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/client/profile")
@RequiredArgsConstructor
@CrossOrigin("*")
public class CnProfileController {

    private final ADCustomerService adCustomerService;

    @GetMapping("/{customerId}")
    public ResponseEntity<?> getProfile(@PathVariable String customerId) {
        return Helper.createResponseEntity(adCustomerService.getCustomerById(customerId));
    }

    @PutMapping(value = "/{customerId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProfile(
            @PathVariable String customerId,
            @ModelAttribute ADCustomerRequest request) {
        request.setId(customerId);
        sanitizeRequest(request);
        return Helper.createResponseEntity(adCustomerService.updateCustomer(request));
    }

    private void sanitizeRequest(ADCustomerRequest request) {
        if ("undefined".equals(request.getEmail()) || "null".equals(request.getEmail())) {
            request.setEmail(null);
        }
    }
}
