package com.example.datn.core.admin.productdetail.model.request;

import com.example.datn.core.admin.serial.model.request.ADSerialRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class BatchCreateProductDetailItemRequest {

    @NotBlank(message = "Mã SPCT không được để trống")
    private String productCode;

    @NotBlank(message = "Phiên bản không được để trống")
    private String versionId;

    @NotBlank(message = "Màu sắc không được để trống")
    private String colorId;

    @NotBlank(message = "Dung lượng không được để trống")
    private String storageCapacityId;

    @NotNull(message = "Giá bán không được để trống")
    @PositiveOrZero(message = "Giá bán phải >= 0")
    private BigDecimal price;

    private String imageUrl;

    private String note;

    @Valid
    private List<ADSerialRequest> serials;
}
