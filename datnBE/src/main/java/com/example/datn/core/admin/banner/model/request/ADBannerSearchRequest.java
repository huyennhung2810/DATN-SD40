package com.example.datn.core.admin.banner.model.request;

import com.example.datn.core.common.base.PageableRequest;
import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ADBannerSearchRequest extends PageableRequest {

    private String title;

    private String position;

    private EntityStatus status;
}

