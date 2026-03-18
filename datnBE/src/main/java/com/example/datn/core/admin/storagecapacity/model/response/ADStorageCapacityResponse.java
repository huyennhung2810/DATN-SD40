package com.example.datn.core.admin.storagecapacity.model.response;

import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ADStorageCapacityResponse {

    private String id;
    private String code;
    private String name;
    private EntityStatus status;
    private String createdTime;
}
