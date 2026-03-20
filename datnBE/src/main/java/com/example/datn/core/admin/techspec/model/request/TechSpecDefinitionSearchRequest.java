package com.example.datn.core.admin.techspec.model.request;

import com.example.datn.core.common.base.PageableRequest;
import com.example.datn.entity.TechSpecDefinition;
import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class TechSpecDefinitionSearchRequest extends PageableRequest {
    private String keyword;
    private String groupId;
    private EntityStatus status;
    private TechSpecDefinition.DataType dataType;
}
