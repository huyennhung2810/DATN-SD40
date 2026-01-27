package com.example.datn.core.admin.customer.model.request;

import com.example.datn.infrastructure.constant.EntityStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ADProductDetailRequest {

    @NotBlank(message = "Mã SPCT không được để trống")
    @Size(max = 13, message = "Mã SPCT không vượt quá 13 kí tự")
    private String code;

    @NotBlank(message = "Tên Version SPCT không được để trống")
    @Size(max = 30, message = "Tên Version SPCT không vượt quá 30 lí tự")
    private String version;

    @NotBlank(message = "Note không được để trống")
    @Size(max = 300, message = "Note không vượt quá 300 kí tự")
    private String note;

    @NotNull(message = "Số lượng không được để trống")
    @Size(message = "Vui lòng nhập số lượng lớn hơn 0")
    private Integer quantity;

    @NotNull(message = "Giá bán không được để trống")
    @Size(message = "Vui lòng nhập giá lớn hơn 0")
    private BigDecimal salePrice;

    private EntityStatus status;
    private String colorId;
    private String productId;
    private String storageCapacityId;
}
