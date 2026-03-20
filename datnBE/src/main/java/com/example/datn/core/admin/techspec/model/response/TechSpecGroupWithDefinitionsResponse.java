package com.example.datn.core.admin.techspec.model.response;

import com.example.datn.core.common.base.IsIdentify;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TechSpecGroupWithDefinitionsResponse implements IsIdentify {
    private String id;
    private String code;
    private String name;
    private String description;
    private Integer displayOrder;
    private List<TechSpecDefinitionResponse> definitions;
}
