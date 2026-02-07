package com.example.datn.core.admin.product.model.request;

import com.example.datn.core.common.base.PageableRequest;
import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ADProductSearchRequest extends PageableRequest {
    
    private String name;
    
    private String idProductCategory;
    
    private String idTechSpec;
    
    private EntityStatus status;
    
    // TechSpec filters
    private String sensorType;
    private String lensMount;
    private String resolution;
    private String processor;
    private String imageFormat;
    private String videoFormat;
    private String iso;
}