package com.example.datn.core.admin.statitics.model.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderDailyResponse {
    private String date;
    private Long total;
}
