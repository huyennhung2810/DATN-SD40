package com.example.datn.core.admin.customer.model.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ADSerialResponse {

    private String id;
    private String code;
    private String serialNumber;
    private String status;
    private Long createdDate;
    private Long updatedDate;
}
