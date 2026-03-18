package com.example.datn.core.admin.serial.model.response;

import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.SerialStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ADSerialResponse {

    private String id;
    private String serialNumber;
    private String code;
    private EntityStatus status;
    private SerialStatus serialStatus;
    private String productName;
    private String productDetailId;
    private String createdDate;

}
