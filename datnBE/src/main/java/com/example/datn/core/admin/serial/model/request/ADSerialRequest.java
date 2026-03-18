package com.example.datn.core.admin.serial.model.request;

import com.example.datn.entity.ProductDetail;
import com.example.datn.infrastructure.constant.EntityStatus;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ADSerialRequest {

    // Code không bắt buộc vì sẽ được tự động sinh nếu không có
    @Size(max = 13, message = "Mã không được quá 13 kí tự")
    private String code;

    // Status không bắt buộc vì sẽ mặc định là ACTIVE nếu không có
    private EntityStatus status;

    @Size(max = 20, message = "Serial Number không vượt quá 20 kí tự")
    private String serialNumber;

    private ProductDetail productDetail;

}
