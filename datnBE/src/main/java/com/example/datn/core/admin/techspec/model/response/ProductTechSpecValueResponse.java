package com.example.datn.core.admin.techspec.model.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductTechSpecValueResponse {
    private String id;
    private String productId;
    private String definitionId;
    private String definitionCode;
    private String definitionName;
    private String definitionDataType;
    private String groupName;
    // Unified value — frontend chỉ cần đọc field này
    private String displayValue;
    // Raw values
    private String valueText;
    private Double valueNumber;
    private Boolean valueBoolean;
}
