package com.example.datn.core.admin.serial.model.request;

import com.example.datn.entity.ProductDetail;
import com.example.datn.infrastructure.constant.EntityStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ADSerialRequest {

    @NotBlank(message = "Serial Code không được để trống")
    @Size(max = 13, message = "Mã không được quá 13 kí tự")
    private String code;

    @NotNull(message = "Status không được để trống")
    private EntityStatus status;

    @NotBlank(message = "Serial Number không được để trống")
    @Size(max = 20, message = "Serial Number không vượt quá 20 kí tự")
    private String serialNumber;

    private ProductDetail productDetail;

}
