package com.example.datn.core.admin.banner.model.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ADBannerSearchRequest {

    private Integer page = 1;

    private Integer size = 10;

    private String keyword;

    private Integer status;

    private String slot;
}

