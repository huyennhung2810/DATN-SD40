package com.example.datn.core.admin.customer.model.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class ADCustomerRequest {

    private String id;
    private String code;

    private String name;

    private String email;

    private String phoneNumber;

    private Boolean gender;

    private Long dateOfBirth;

    // image
    private MultipartFile image;
    private String imageUrl;

    private List<ADAddressRequest> addresses;
}
