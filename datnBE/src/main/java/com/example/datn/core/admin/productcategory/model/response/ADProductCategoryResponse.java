package com.example.datn.core.admin.productcategory.model.response;

import com.example.datn.core.common.base.IsIdentify;
import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ADProductCategoryResponse implements IsIdentify {
    private String id;
    private String code;
    private String name;
    private String description;
    private EntityStatus status;
    private Long createdAt;
    private Long updatedAt;
}