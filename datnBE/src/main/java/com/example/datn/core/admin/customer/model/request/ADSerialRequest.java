package com.example.datn.core.admin.customer.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ADSerialRequest {

    @NotBlank(message = "Serial Code không được để trống")
    @Size(max = 13, message = "Mã không được quá 13 kí tự")
    private String code;

    private String status;

    @NotBlank(message = "Serial Number không được để trống")
    @Size(max = 20, message = "Serial Number không vượt quá 20 kí tự")
    private String serialNumber;

    private String productDetailId;
}
