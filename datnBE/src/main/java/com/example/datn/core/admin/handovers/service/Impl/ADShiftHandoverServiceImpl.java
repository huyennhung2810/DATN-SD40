package com.example.datn.core.admin.handovers.service.Impl;

import com.example.datn.core.admin.handovers.model.request.ADConfirmShiftRequest;
import com.example.datn.core.admin.handovers.model.request.ADShiftHandoverCheckInRequest;
import com.example.datn.core.admin.handovers.model.request.ADShiftHandoverCheckOutRequest;
import com.example.datn.core.admin.handovers.model.request.ADShiftHistoryRequest;
import com.example.datn.core.admin.handovers.model.response.ADShiftHandoverStatsResponse;
import com.example.datn.core.admin.handovers.model.response.ADShiftHistoryResponse;
import com.example.datn.core.admin.handovers.repository.ADShiftHandoverRepository;
import com.example.datn.core.admin.handovers.service.ADShiftHandoverService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.ShiftHandover;
import com.example.datn.entity.WorkSchedule;
import com.example.datn.infrastructure.constant.HandoverStatus;
import com.example.datn.infrastructure.constant.OrderStatus;
import com.example.datn.infrastructure.constant.ShiftStatus;
import com.example.datn.repository.WorkScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ADShiftHandoverServiceImpl implements ADShiftHandoverService {

    private final ADShiftHandoverRepository shiftHandoverRepository;
    private final WorkScheduleRepository workScheduleRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public ResponseObject<?> checkIn(ADShiftHandoverCheckInRequest request) {
        WorkSchedule schedule = workScheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new RuntimeException("Lịch làm việc không tồn tại"));

        if (schedule.getShiftStatus() == ShiftStatus.WORKING) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Bạn đã check-in ca này rồi!");
        }

        // Tự động lấy tiền đầu ca từ thực tế cuối ca trước (nếu request gửi lên null)
        BigDecimal initialCash = request.getInitialCash();
        if (initialCash == null) {
            initialCash = shiftHandoverRepository
                    .findTopByHandoverStatusOrderByCheckOutTimeDesc(HandoverStatus.CLOSED)
                    .map(ShiftHandover::getActualCashAtEnd)
                    .orElse(BigDecimal.ZERO);
        }

        ShiftHandover handover = new ShiftHandover();
        handover.setWorkSchedule(schedule);
        handover.setCheckInTime(System.currentTimeMillis());
        handover.setInitialCash(initialCash);
        handover.setNote(request.getNote());
        handover.setHandoverStatus(HandoverStatus.OPEN);

        schedule.setShiftStatus(ShiftStatus.WORKING);
        workScheduleRepository.save(schedule);

        ShiftHandover saved = shiftHandoverRepository.save(handover);
        return ResponseObject.success(mapToStats(saved), "Check-in thành công");
    }

    @Override
    @Transactional
    public ResponseObject<?> checkOut(ADShiftHandoverCheckOutRequest request) {
        ShiftHandover handover = shiftHandoverRepository.findByWorkSchedule_Id(request.getScheduleId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dữ liệu giao ca"));

        if (handover.getHandoverStatus() != HandoverStatus.OPEN) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Ca làm việc này không ở trạng thái có thể kết ca.");
        }

        Long endTime = System.currentTimeMillis();
        String empId = handover.getWorkSchedule().getEmployee().getId();

        //Lấy tổng doanh thu tiền mặt thực tế từ bảng Order
        BigDecimal systemCashSales = shiftHandoverRepository.sumCashRevenue(
                empId, OrderStatus.COMPLETED, handover.getCheckInTime(), endTime);

        //Tính toán tiền theo hệ thống
        BigDecimal withdraw = Optional.ofNullable(request.getWithdrawAmount()).orElse(BigDecimal.ZERO);
        BigDecimal actual = Optional.ofNullable(request.getActualCash()).orElse(BigDecimal.ZERO);

        // Expected = Đầu ca + Doanh thu mặt - Rút ra
        BigDecimal expected = handover.getInitialCash().add(systemCashSales).subtract(withdraw);
        BigDecimal difference = actual.subtract(expected);

        // Cập nhật dữ liệu
        handover.setCheckOutTime(endTime);
        handover.setTotalCashSales(systemCashSales);
        handover.setCashWithdraw(withdraw);
        handover.setActualCashAtEnd(actual);
        handover.setDifferenceAmount(difference);
        handover.setNote(request.getNote());

        // Xử lý trạng thái và Cảnh báo
        if (difference.signum() != 0) {
            if (!StringUtils.hasText(request.getNote())) {
                return ResponseObject.error(HttpStatus.BAD_REQUEST, "Tiền bị lệch! Vui lòng nhập lý do vào ghi chú.");
            }
            handover.setHandoverStatus(HandoverStatus.PENDING); // Đợi Admin duyệt vì lệch tiền

            // Gửi thông báo WebSocket cho Admin
            sendAdminAlert(empId, difference);
        } else {
            handover.setHandoverStatus(HandoverStatus.CLOSED);
        }

        //Kết thúc lịch làm việc
        WorkSchedule schedule = handover.getWorkSchedule();
        schedule.setShiftStatus(ShiftStatus.COMPLETED);
        workScheduleRepository.save(schedule);

        shiftHandoverRepository.save(handover);
        return ResponseObject.success(mapToStats(handover), "Kết ca thành công!");
    }

    private void sendAdminAlert(String empId, BigDecimal diff) {
        try {
            String message = String.format("Cảnh báo: Nhân viên %s kết ca lệch %s VND", empId, diff);
            messagingTemplate.convertAndSend("/topic/admin/notifications", message);
        } catch (Exception e) {
            log.error("Lỗi gửi thông báo WebSocket: {}", e.getMessage());
        }
    }

    private ADShiftHandoverStatsResponse mapToStats(ShiftHandover h) {
        return ADShiftHandoverStatsResponse.builder()
                .handoverId(h.getId())
                .initialCash(h.getInitialCash())
                .build();
    }

    @Override
    public ResponseObject<?> getShiftStats(String scheduleId) {
        return shiftHandoverRepository.findByWorkSchedule_Id(scheduleId)
                .map(h -> ResponseObject.success(mapToStats(h), "Thành công"))
                .orElse(ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy ca trực"));
    }


    @Override
    public ResponseObject<?> getShiftHistory(ADShiftHistoryRequest request) {
        // Pageable giúp hệ thống không bị chậm khi có hàng nghìn bản ghi
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());

        Page<ShiftHandover> pageData = shiftHandoverRepository.findHistory(
                request.getStaffId(),
                request.getStatus(),
                request.getFromDate(),
                request.getToDate(),
                pageable
        );

        // Chuyển đổi sang DTO
        Page<ADShiftHistoryResponse> result = pageData.map(s -> ADShiftHistoryResponse.builder()
                .id(s.getId())
                .employeeName(s.getWorkSchedule().getEmployee().getName())
                .checkInTime(s.getCheckInTime())
                .checkOutTime(s.getCheckOutTime())
                .initialCash(s.getInitialCash())
                .totalCashSales(s.getTotalCashSales())
                .cashWithdraw(s.getCashWithdraw())
                .actualCashAtEnd(s.getActualCashAtEnd())
                .differenceAmount(s.getDifferenceAmount())
                .note(s.getNote())
                .status(s.getHandoverStatus().name())
                .build());

        return ResponseObject.success(result, "Lấy lịch sử giao ca thành công");
    }

    @Transactional
    @Override
    public ResponseObject<?> confirmShift(ADConfirmShiftRequest request) {
        ShiftHandover handover = shiftHandoverRepository.findById(request.getHandoverId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu giao ca"));

        if (handover.getHandoverStatus() != HandoverStatus.PENDING) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Chỉ có thể duyệt các ca đang ở trạng thái chờ (lệch tiền).");
        }

        // Cập nhật trạng thái
        handover.setHandoverStatus(HandoverStatus.CLOSED);
        handover.setNote(handover.getNote() + " | Admin Note: " + request.getAdminNote());

        shiftHandoverRepository.save(handover);
        return ResponseObject.success(null, "Duyệt ca thành công");
    }
}
