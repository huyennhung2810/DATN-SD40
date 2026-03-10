package com.example.datn.service.banner.dto;

import com.example.datn.core.common.base.PageableRequest;
import com.example.datn.infrastructure.constant.BannerPosition;
import com.example.datn.infrastructure.constant.BannerType;
import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BannerSearchRequest extends PageableRequest {

    private String keyword;

    private EntityStatus status;

    private BannerPosition position;

    private BannerType type;
}
