package com.example.datn.core.client.voucher.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailableCouponsResponse {

    private AvailableCouponResponse bestCoupon;
    private List<AvailableCouponResponse> availableCoupons;
}
