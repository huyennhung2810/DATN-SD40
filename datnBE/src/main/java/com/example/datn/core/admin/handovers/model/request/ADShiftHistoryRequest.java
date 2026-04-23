package com.example.datn.core.admin.handovers.model.request;

import com.example.datn.infrastructure.constant.HandoverStatus;
import lombok.*;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ADShiftHistoryRequest {
    private String code;
    private String staffId;      // Lọc theo nhân viên
    private HandoverStatus status; // Lọc theo trạng thái (OPEN, CLOSED, PENDING)
    private Long fromDate;       // Từ ngày (milis)
    private Long toDate;         // Đến ngày (milis)

    // Phân trang
    private int page = 0;
    private int size = 10;
}
