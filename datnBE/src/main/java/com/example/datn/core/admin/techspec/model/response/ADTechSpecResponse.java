package com.example.datn.core.admin.techspec.model.response;

import com.example.datn.core.common.base.IsIdentify;
import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ADTechSpecResponse implements IsIdentify {
    private String id;
    private String sensorType;
    private String lensMount;
    private String resolution;
    private String iso;
    private String processor;
    private String imageFormat;
    private String videoFormat;
    private EntityStatus status;
    private Long createdAt;
    private Long updatedAt;
}