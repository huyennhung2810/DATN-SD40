package com.example.datn.infrastructure.constant;

public enum ShiftStatus {

    REGISTERED, //Đã đăng ký/phân công
    WORKING, //Đang làm việc (Đã checkin)
    COMPLETED, //Đã hoàn thành (Đã checkout)
    ABSENT //Vắng mặt
}
