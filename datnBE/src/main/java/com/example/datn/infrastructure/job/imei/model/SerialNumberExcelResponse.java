package com.example.datn.infrastructure.job.imei.model;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class SerialNumberExcelResponse {

    private String serialNumber;

    //Kiểm tra đã có trong hệ thống chưa
    private Boolean isExist;
}
