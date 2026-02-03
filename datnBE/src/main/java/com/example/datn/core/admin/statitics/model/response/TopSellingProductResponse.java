package com.example.datn.core.admin.statitics.model.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopSellingProductResponse {

    private Integer rank;
    private String id;
    private String productCode;
    private String productName;
    private String productImage;
    private Long quantitySold;
    private BigDecimal revenue;
    private BigDecimal price;
}
