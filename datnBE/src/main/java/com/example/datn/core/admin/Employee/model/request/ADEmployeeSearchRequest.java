package com.example.datn.core.admin.Employee.model.request;


import com.example.datn.core.common.base.PageableRequest;
import com.example.datn.infrastructure.constant.EntityStatus;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = false)
@Data
public class ADEmployeeSearchRequest extends PageableRequest {
    @Size(max = 100, message = "Từ khóa tìm kiếm tối đa 100 ký tự")
    private String keyword;

    private String role;

    private Boolean gender;
    private EntityStatus status;
}
