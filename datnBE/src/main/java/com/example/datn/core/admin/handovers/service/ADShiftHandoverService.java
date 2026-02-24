package com.example.datn.core.admin.handovers.service;

import com.example.datn.core.admin.handovers.model.request.ADShiftHandoverCheckInRequest;
import com.example.datn.core.admin.handovers.model.request.ADShiftHandoverCheckOutRequest;
import com.example.datn.core.common.base.ResponseObject;
import org.springframework.transaction.annotation.Transactional;

public interface ADShiftHandoverService {

    @Transactional
    ResponseObject<?> checkIn(ADShiftHandoverCheckInRequest request);

    ResponseObject<?> getShiftStats(String scheduleId);

    @Transactional
    ResponseObject<?> checkOut(ADShiftHandoverCheckOutRequest request);
}
