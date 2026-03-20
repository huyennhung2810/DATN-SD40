package com.example.datn.core.admin.techspec.service;

import com.example.datn.core.admin.techspec.model.request.TechSpecGroupRequest;
import com.example.datn.core.admin.techspec.model.request.TechSpecGroupSearchRequest;
import com.example.datn.core.admin.techspec.model.response.TechSpecGroupResponse;
import com.example.datn.core.common.base.PageableObject;

public interface TechSpecGroupService {

    PageableObject<TechSpecGroupResponse> search(TechSpecGroupSearchRequest request);

    TechSpecGroupResponse create(TechSpecGroupRequest request);

    TechSpecGroupResponse update(String id, TechSpecGroupRequest request);

    void delete(String id);

    TechSpecGroupResponse findById(String id);
}
