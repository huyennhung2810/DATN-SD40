package com.example.datn.core.admin.statitics.model.response;

import java.math.BigDecimal;

public interface ADTopSellingProductsResponse {

    String getId();
    String getName();
    String getImageUrl();
    BigDecimal getPrice();
    Long getSoldCount();
}
