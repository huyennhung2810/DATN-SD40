package com.example.datn.infrastructure.job.common.model.response;

public interface ExImportLogDetailResponse {

    //Trả về chi tiết lỗi từng dòng.
    // (Ví dụ: "Dòng số 5: Giá tiền không được để trống").
    String getLine();

    String getMessage();

    Integer getStatus();
}
