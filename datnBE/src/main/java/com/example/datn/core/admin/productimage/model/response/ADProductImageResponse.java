package com.example.datn.core.admin.productimage.model.response;

import com.example.datn.core.common.base.IsIdentify;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ADProductImageResponse implements IsIdentify {

    private String id;

    private String idProduct;

    private String productName;

    private Integer displayOrder;

    private String url;

    private Long createdDate;
}