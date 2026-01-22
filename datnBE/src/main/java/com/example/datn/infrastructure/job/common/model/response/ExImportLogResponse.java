package com.example.datn.infrastructure.job.common.model.response;

import com.example.datn.core.common.base.IsIdentify;

public interface ExImportLogResponse extends IsIdentify {

    //Trả về kết quả tổng quát của một lần Import
    // (Ví dụ: "File máy_ảnh.xlsx, Thành công: 90, Lỗi: 10").
    String getFileName();

    Integer getTotalSuccess();

    Integer getTotalError();

    Long getCreatedAt();
}
