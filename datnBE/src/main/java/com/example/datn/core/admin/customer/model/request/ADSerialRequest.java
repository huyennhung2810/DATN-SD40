package com.example.datn.core.admin.customer.model.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ADSerialRequest {

    @NotBlank(message = "Serial Code không được để trống")
    private String code;

    private String status;

    @NotBlank(message = "Serial Number không được để trống")
    private String serialNumber;

    private String productDetailId;
}
