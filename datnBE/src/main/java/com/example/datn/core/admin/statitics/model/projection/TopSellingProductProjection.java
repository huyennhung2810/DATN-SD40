package com.example.datn.core.admin.statitics.model.projection;

import java.math.BigDecimal;

public interface TopSellingProductProjection {
    String getProductId();
    String getProductName();
    String getProductVersion();
    String getCategoryName();

    Long getQuantitySold();
    BigDecimal getRevenue();
    BigDecimal getSellingPrice();

    String getImageUrl();
}
