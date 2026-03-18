package com.example.datn.core.admin.product.model.request;

import com.example.datn.core.common.base.PageableRequest;
import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CustomerProductSearchRequest extends PageableRequest {
    
    // Basic filters
    private String name;
    private String idProductCategory;
    private String idBrand;
    private String idTechSpec;
    private EntityStatus status = EntityStatus.ACTIVE;
    
    // TechSpec filters
    private String sensorType;
    private String lensMount;
    private String resolution;
    private String processor;
    private String imageFormat;
    private String videoFormat;
    private String iso;
    
    // Price filters
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    
    // Sorting
    private String sortBy = "createdDate";
    private String orderBy = "desc";
}


