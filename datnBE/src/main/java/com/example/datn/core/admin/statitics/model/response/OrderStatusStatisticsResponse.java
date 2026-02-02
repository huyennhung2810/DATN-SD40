package com.example.datn.core.admin.statitics.model.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderStatusStatisticsResponse {

    private String key;
    private String label;
    private String color;


    private Long orderCount;
    private Double percentage;
}
