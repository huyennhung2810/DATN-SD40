package com.example.datn.core.admin.statitics.model.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ADRevenueStatDTO implements ADRevenueStatResponse{

    private String date;
    private BigDecimal revenue;


    @Override
    public String getDate() {
        return this.date;
    }

    @Override
    public BigDecimal getRevenue() {
        return this.revenue;
    }
}
