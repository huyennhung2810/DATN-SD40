package com.example.datn.core.admin.customer.controller;


import com.example.datn.core.admin.customer.model.request.ADAddressRequest;
import com.example.datn.core.admin.customer.service.ADAddressService;
import com.example.datn.infrastructure.constant.MappingConstants;
import com.example.datn.utils.Helper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(MappingConstants.API_ADMIN_PREFIX_CUSTOMER_ADDRESSES)
@RequiredArgsConstructor
@Slf4j
public class ADAddressController {

    private final ADAddressService adAddressService;

    @GetMapping
    public ResponseEntity<?> getByCustomer(@PathVariable String customerId) {
        return Helper.createResponseEntity(adAddressService.getByCustomer(customerId));
    }

    @PostMapping
    public ResponseEntity<?> createOrUpdate(
            @PathVariable String customerId,
            @Valid  @RequestBody ADAddressRequest request
    ) {
        return Helper.createResponseEntity(adAddressService.createOrUpdate(customerId, request));
    }

    @PutMapping("/{id}/set_default")
    public ResponseEntity<?> setDefault(@PathVariable String id) {
        return Helper.createResponseEntity(adAddressService.setDefault(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        return Helper.createResponseEntity(adAddressService.delete(id));
    }
}
