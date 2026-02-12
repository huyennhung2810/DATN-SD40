package com.example.datn.core.admin.statitics.model.response;

import java.math.BigDecimal;

public interface ADLowstockProductResponse {
    String getId();
    String getName();
    String getVersion();
    BigDecimal getPrice();
    Integer getQuantity();
    String getImageUrl();
}
