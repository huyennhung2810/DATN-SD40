package com.example.datn.core.admin.productDetail.model.request;

import com.example.datn.core.admin.serial.model.request.ADSerialRequest;
import com.example.datn.infrastructure.constant.EntityStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ADProductDetailRequest {

    @NotBlank(message = "Mã SPCT không được để trống")
    @Size(max = 13, message = "Mã SPCT không vượt quá 13 kí tự")
    private String code;

    @NotBlank(message = "Tên Version SPCT không được để trống")
    @Size(max = 30, message = "Tên Version SPCT không vượt quá 30 lí tự")
    private String version;

    @Size(max = 300, message = "Note không vượt quá 300 kí tự")
    private String note;

    @NotNull(message = "Số lượng không được để trống")
    private Integer quantity;

    @NotNull(message = "Giá bán không được để trống")
    private BigDecimal salePrice;

    @NotNull(message = "Trạng thái không được để trống")
    private EntityStatus status;

    @NotNull(message = "Màu sắc không được để trống")
    private String colorId;

    @NotNull(message = "Sản phẩm không được để trống")
    private String productId;

    @NotNull(message = "Dung lượng không được để trống")
    private String storageCapacityId;

    private List<ADSerialRequest> serials;

}
