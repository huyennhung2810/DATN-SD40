package com.example.datn.core.admin.techspec.model.response;

import com.example.datn.core.common.base.IsIdentify;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TechSpecDefinitionItemResponse implements IsIdentify {
    private String id;
    private String definitionId;
    private String definitionCode;
    private String definitionName;
    private String name;
    private String code;
    private String value;
    private Integer displayOrder;
    private String status;
    private Long createdAt;
    private Long updatedAt;
}
