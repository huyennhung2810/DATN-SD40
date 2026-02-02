package com.example.datn.core.admin.customer.model.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ADAddressResponse {
    private String id;
    private String name;
    private String phoneNumber;
    private String provinceCity;
    private String wardCommune;
    private Integer provinceCode;
    private Integer wardCode;
    private String addressDetail;
    private Boolean isDefault;
}
