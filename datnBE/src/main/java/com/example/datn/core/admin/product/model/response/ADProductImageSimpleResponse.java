package com.example.datn.core.admin.product.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ADProductImageSimpleResponse {

    private String id;
    private String url;
    private Integer displayOrder;
}
