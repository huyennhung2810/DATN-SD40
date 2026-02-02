package com.example.datn.core.admin.statitics.model.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderStatisticsResponse {

    private String date;

    private Long orderCount;

    private Long timestamp;
}
