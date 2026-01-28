package com.example.datn.core.admin.storagecapacity.model.request;

import com.example.datn.infrastructure.constant.EntityStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ADStorageCapacityRequest {

    @NotBlank(message = "Mã dung lượng không được để trống")
    @Size(max = 13, message = "Mã không vượt quá 13 ký tự")
    private String code;

    @NotBlank(message = "Tên dung lượng không được để trống")
    @Size(max = 30, message = "Tên dung lượng không vượt quá 30 ký tự")
    private String name;

    private EntityStatus status;
}
