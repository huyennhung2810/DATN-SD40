package com.example.datn.core.admin.statitics.model.response;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class ADGrowthStatResponse {
    private String label;
    private BigDecimal value;
    private Double growth;
    private Boolean isCurrency;
}
