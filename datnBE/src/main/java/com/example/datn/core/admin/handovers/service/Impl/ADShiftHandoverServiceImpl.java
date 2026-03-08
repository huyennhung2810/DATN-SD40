package com.example.datn.core.admin.handovers.service.Impl;

import com.example.datn.core.admin.handovers.model.request.ADShiftHandoverCheckInRequest;
import com.example.datn.core.admin.handovers.model.request.ADShiftHandoverCheckOutRequest;
import com.example.datn.core.admin.handovers.model.response.ADShiftHandoverStatsResponse;
import com.example.datn.core.admin.handovers.repository.ADShiftHandoverRepository;
import com.example.datn.core.admin.handovers.service.ADShiftHandoverService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.ShiftHandover;
import com.example.datn.entity.WorkSchedule;
import com.example.datn.infrastructure.constant.HandoverStatus;
import com.example.datn.infrastructure.constant.ShiftStatus;
import com.example.datn.repository.ProductRepository;
import com.example.datn.repository.WorkScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ADShiftHandoverServiceImpl implements ADShiftHandoverService {

    private final ADShiftHandoverRepository shiftHandoverRepository;
    private final WorkScheduleRepository workScheduleRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public ResponseObject<?> checkIn(ADShiftHandoverCheckInRequest request) {
        Optional<WorkSchedule> scheduleOpt = workScheduleRepository.findById(request.getScheduleId());
        if (scheduleOpt.isEmpty()) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Lịch làm việc không tồn tại");
        }
        WorkSchedule workSchedule = scheduleOpt.get();

        if (workSchedule.getShiftStatus() == ShiftStatus.WORKING) {
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
        shiftHandover.setNote(request.getNote());

        // 2. SỬA LỖI LOGIC: Đổi CLOSED thành OPEN (hoặc trạng thái tương đương của bạn)
        shiftHandover.setHandoverStatus(HandoverStatus.OPEN);

        workSchedule.setShiftStatus(ShiftStatus.WORKING);
        workScheduleRepository.save(workSchedule);

        ShiftHandover saved = shiftHandoverRepository.save(shiftHandover);
        ADShiftHandoverStatsResponse response = ADShiftHandoverStatsResponse.builder()
                .handoverId(saved.getId())
                .initialCash(saved.getInitialCash())
                .build();
        return ResponseObject.success(response, "Check-in thành công");
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
    @Transactional // Thêm @Transactional để đảm bảo an toàn dữ liệu khi lưu nhiều bảng
    public ResponseObject<?> checkOut(ADShiftHandoverCheckOutRequest request) {
        ShiftHandover handover = shiftHandoverRepository.findByWorkSchedule_Id(request.getScheduleId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu giao ca"));

        if(handover.getHandoverStatus() != HandoverStatus.OPEN) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Phiếu giao ca không hợp lệ (Đã kết thúc hoặc chưa mở)");
        }

        // 1. SỬA LỖI TYPE MISMATCH: Dùng kiểu Long (mili-giây) thay vì LocalDateTime
        Long startTime = handover.getCheckInTime();
        Long endTime = System.currentTimeMillis();
        String empId = handover.getWorkSchedule().getEmployee().getId();

        // 2. SỬA LỖI NULL POINTER: Xử lý an toàn khi hệ thống không có hóa đơn nào
        BigDecimal systemCashSales = shiftHandoverRepository.sumCashRevenue(empId, startTime, endTime);
        if (systemCashSales == null) {
            systemCashSales = BigDecimal.ZERO;
        }

        BigDecimal withdrawAmount = request.getWithdrawAmount() != null ? request.getWithdrawAmount() : BigDecimal.ZERO;

        // Soát lại tiền
        BigDecimal expectedCash = handover.getInitialCash().add(systemCashSales).subtract(withdrawAmount);
        BigDecimal actualCash = request.getActualCash() != null ? request.getActualCash() : BigDecimal.ZERO;
        BigDecimal difference = actualCash.subtract(expectedCash);

        // Cập nhật thông tin phiếu giao ca
        handover.setCheckOutTime(endTime); // Dùng luôn endTime vừa tạo ở trên
        handover.setTotalCashSales(systemCashSales);
        handover.setCashWithdraw(withdrawAmount);
        handover.setActualCashAtEnd(actualCash);
        handover.setDifferenceAmount(difference);
        handover.setNote(request.getNote());

        // Kiểm tra lệch tiền
        if (difference.compareTo(BigDecimal.ZERO) == 0) {
            handover.setHandoverStatus(HandoverStatus.CLOSED);
        } else {
            handover.setHandoverStatus(HandoverStatus.PENDING);
            if (!StringUtils.hasText(request.getNote())) {
                return ResponseObject.error(HttpStatus.BAD_REQUEST, "Số tiền bị lệch so với hệ thống! Bắt buộc phải nhập lý do/ghi chú.");
            }
        }

        // Lưu trạng thái Lịch làm việc
        WorkSchedule schedule = handover.getWorkSchedule();
        schedule.setShiftStatus(ShiftStatus.COMPLETED);
        workScheduleRepository.save(schedule);

        // Lưu trạng thái Phiếu giao ca
        ShiftHandover savedHandover = shiftHandoverRepository.save(handover);

        // 3. SỬA LỖI BYTEBUDDY 500: Map dữ liệu sang DTO trước khi trả về
        ADShiftHandoverStatsResponse response = ADShiftHandoverStatsResponse.builder()
                .handoverId(savedHandover.getId())
                .initialCash(savedHandover.getInitialCash())
                .build();

        return ResponseObject.success(response, "Thực hiện giao ca thành công");
    }
}
