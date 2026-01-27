package com.example.datn.core.admin.customer.model.response;

import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ADProductDetailResponse {

    private String id;
    private String code;
    private String note;
    private String version;
    private Integer quantity;
    private BigDecimal salePrice;
    private EntityStatus status;
    private String colorName;
    private String productName;
    private String storageCapacityName;
    private String creationDate;
}
