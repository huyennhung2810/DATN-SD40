package com.example.datn.core.admin.product.model.response;

import com.example.datn.core.admin.techspec.model.response.ADTechSpecResponse;
import com.example.datn.core.common.base.IsIdentify;
import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ADProductResponse implements IsIdentify {
    
    private String id;
    
    private String name;
    
    private String description;
    
    private String idProductCategory;
    
    private String productCategoryName;
    
    private String idTechSpec;
    
    private String techSpecName;
    
    // techSpec
    private ADTechSpecResponse techSpec;
    
    private EntityStatus status;
    
    private Long createdDate;
    
    private Long lastModifiedDate;
    
    // Danh sách URL ảnh
    private List<String> imageUrls;
}