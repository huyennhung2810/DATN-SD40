package com.example.datn.core.admin.workSchedule.service;

import com.example.datn.core.admin.workSchedule.model.request.ADCreateScheduleRequest;
import com.example.datn.core.admin.workSchedule.model.request.ADScheduleSearchRequest;
import com.example.datn.core.common.base.ResponseObject;
import org.springframework.transaction.annotation.Transactional;

public interface ADWorkScheduleService {
    // Lấy danh sách lịch (thường dùng cho Calendar view)
    ResponseObject<?> getSchedules(ADScheduleSearchRequest request);

    // Phân ca làm việc
    @Transactional
    ResponseObject<?> assignShift(ADCreateScheduleRequest request);

    // Xóa ca làm việc
    @Transactional
    ResponseObject<?> deleteSchedule(String id);

    //Sửa lịch
    ResponseObject<?> updateSchedule(String id, ADCreateScheduleRequest request);

    ResponseObject<?> getTodaySchedule(String employeeId);
}
