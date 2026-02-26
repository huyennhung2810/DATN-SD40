package com.example.datn.core.admin.handovers.service.Impl;

import com.example.datn.core.admin.handovers.model.request.ADShiftHandoverCheckInRequest;
import com.example.datn.core.admin.handovers.model.request.ADShiftHandoverCheckOutRequest;
import com.example.datn.core.admin.handovers.model.request.ADShiftHandoverProductAuditRequest;
import com.example.datn.core.admin.handovers.model.response.ADShiftHandoverStatsResponse;
import com.example.datn.core.admin.handovers.repository.ADShiftHandoverRepository;
import com.example.datn.core.admin.handovers.service.ADShiftHandoverService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.HandoverProductAudit;
import com.example.datn.entity.ShiftHandover;
import com.example.datn.entity.WorkSchedule;
import com.example.datn.infrastructure.constant.HandoverStatus;
import com.example.datn.infrastructure.constant.ShiftStatus;
import com.example.datn.repository.HandoverProductAuditRepository;
import com.example.datn.repository.ProductRepository;
import com.example.datn.repository.WorkScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ADShiftHandoverServiceImpl implements ADShiftHandoverService {

    private final ADShiftHandoverRepository shiftHandoverRepository;
    private final WorkScheduleRepository workScheduleRepository;
    private final HandoverProductAuditRepository handoverProductAuditRepository;
    private final ProductRepository productRepository;

    @Override
    public ResponseObject<?> checkIn(ADShiftHandoverCheckInRequest request) {
        WorkSchedule workSchedule = workScheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new RuntimeException("Lịch làm việc không tồn tại"));

        if(workSchedule.getShiftStatus() == ShiftStatus.WORKING) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Ca làm việc này đã được Check-in");
        }

        BigDecimal initialCash = request.getInitialCash();
        if (initialCash == null) {
            Optional<ShiftHandover> lastShift = shiftHandoverRepository
                    .findTopByHandoverStatusOrderByCheckOutTimeDesc(HandoverStatus.CLOSED.name());
            initialCash = lastShift.map(ShiftHandover::getActualCashAtEnd).orElse(BigDecimal.ZERO);
        }

        ShiftHandover shiftHandover = new ShiftHandover();
        shiftHandover.setWorkSchedule(workSchedule);
        shiftHandover.setCheckInTime(System.currentTimeMillis());
        shiftHandover.setInitialCash(initialCash);
        shiftHandover.setHandoverStatus(HandoverStatus.CLOSED);
        shiftHandover.setNote(request.getNote());

        workSchedule.setShiftStatus(ShiftStatus.WORKING);
        workScheduleRepository.save(workSchedule);

        ShiftHandover saved = shiftHandoverRepository.save(shiftHandover);
        return ResponseObject.success(saved, "Check-in thành công");
    }

    @Override
    public ResponseObject<?> getShiftStats(String scheduleId) {
        ShiftHandover handover = shiftHandoverRepository.findByWorkSchedule_Id(scheduleId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu giao ca"));

        ADShiftHandoverStatsResponse response = ADShiftHandoverStatsResponse.builder()
                .handoverId(handover.getId())
                .initialCash(handover.getInitialCash())
                .build();

        return ResponseObject.success(response, "Lấy thông tin tiền đầu ca thành công");
    }

    @Override
    public ResponseObject<?> checkOut(ADShiftHandoverCheckOutRequest request) {
        ShiftHandover handover = shiftHandoverRepository.findByWorkSchedule_Id(request.getScheduleId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu giao ca"));

        if(handover.getHandoverStatus() == HandoverStatus.OPEN) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Phiếu giao ca không hợp lệ(Chưa mở hoặc đã kết thúc)");
        }

        //Tính toán doanh thu
        LocalDateTime startTime = Instant.ofEpochMilli(handover.getCheckInTime()).atZone(ZoneId.systemDefault())
                .toLocalDateTime();
        LocalDateTime endTime = LocalDateTime.now();
        String empId = handover.getWorkSchedule().getEmployee().getId();

        BigDecimal systemCashSales = shiftHandoverRepository.sumCashRevenue(empId, startTime, endTime);
        BigDecimal withdrawAmount = request.getWithdrawAmount() != null ? request.getWithdrawAmount() : BigDecimal.ZERO;

        //Soát lại tiền
        BigDecimal expectedCash = handover.getInitialCash().add(systemCashSales).subtract(withdrawAmount);
        BigDecimal actualCash = request.getActualCash() != null ? request.getActualCash() : BigDecimal.ZERO;
        BigDecimal difference = actualCash.subtract(expectedCash);


        handover.setCheckOutTime(System.currentTimeMillis());
        handover.setTotalCashSales(systemCashSales);
        handover.setCashWithdraw(withdrawAmount);
        handover.setActualCashAtEnd(actualCash);
        handover.setDifferenceAmount(difference);
        handover.setNote(request.getNote());

        if (difference.compareTo(BigDecimal.ZERO) == 0) {
            handover.setHandoverStatus(HandoverStatus.CLOSED);
        } else {
            handover.setHandoverStatus(HandoverStatus.PENDING);
            if (!StringUtils.hasText(request.getNote())) {
                return ResponseObject.error(HttpStatus.BAD_REQUEST, "Số tiền bị lệch so với hệ thống! Bắt buộc phải nhập lý do/ghi chú.");
            }
        }

        //Lưu dữ liệu kiểm kê
        if (request.getAudits() != null && !request.getAudits().isEmpty()) {
            List<HandoverProductAudit> auditList = new ArrayList<>();
            for (ADShiftHandoverProductAuditRequest auditReq : request.getAudits()) {
                HandoverProductAudit audit = new HandoverProductAudit();
                audit.setShiftHandover(handover);
                audit.setProduct(productRepository.getReferenceById(auditReq.getProductId()));
                audit.setActualQuantity(auditReq.getActualQuantity());
                audit.setConditionNote(auditReq.getConditionNote());
                auditList.add(audit);
            }
            handoverProductAuditRepository.saveAll(auditList);
        }

        WorkSchedule schedule = handover.getWorkSchedule();
        schedule.setShiftStatus(ShiftStatus.COMPLETED);
        workScheduleRepository.save(schedule);

        shiftHandoverRepository.save(handover);

        return ResponseObject.success(handover, "Thực hiện giao ca thành công");
    }
}
