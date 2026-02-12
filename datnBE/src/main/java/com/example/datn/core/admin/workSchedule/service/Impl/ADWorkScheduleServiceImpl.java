package com.example.datn.core.admin.workSchedule.service.Impl;

import com.example.datn.core.admin.workSchedule.model.request.ADCreateScheduleRequest;
import com.example.datn.core.admin.workSchedule.model.request.ADScheduleSearchRequest;
import com.example.datn.core.admin.workSchedule.model.response.ADWorkScheduleResponse;
import com.example.datn.core.admin.workSchedule.repository.ADWorkScheduleRepository;
import com.example.datn.core.admin.workSchedule.service.ADWorkScheduleService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.Employee;
import com.example.datn.entity.ShiftTemplate;
import com.example.datn.entity.WorkSchedule;
import com.example.datn.infrastructure.constant.ShiftStatus;
import com.example.datn.repository.EmployeeRepository;
import com.example.datn.repository.ProductRepository;
import com.example.datn.repository.ShiftTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ADWorkScheduleServiceImpl implements ADWorkScheduleService {

    private final ADWorkScheduleRepository adWorkScheduleRepository;
    private final EmployeeRepository employeeRepository;
    private final ShiftTemplateRepository shiftTemplateRepository;

    private ADWorkScheduleResponse mapToResponse (WorkSchedule entity) {
        return ADWorkScheduleResponse.builder()
                .id(entity.getId())
                .employeeId(entity.getEmployee().getId())
                .employeeName(entity.getEmployee().getName())
                .employeeCode(entity.getEmployee().getCode())
                .shiftName(entity.getShiftTemplate().getName())
                .startTime(entity.getShiftTemplate().getStartTime())
                .endTime(entity.getShiftTemplate().getEndTime())
                .workDate(entity.getWorkDate())
                .status(entity.getShiftStatus())
                .build();
    }

    @Override
    public ResponseObject<?> getSchedules(ADScheduleSearchRequest request) {
        if(request.getFromDate() == null || request.getToDate() == null){
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Vui lòng chọn khoảng thời gian cần xem");
        }

        List<WorkSchedule> schedules = adWorkScheduleRepository.findSchedulesInRange(request.getFromDate(), request.getToDate());

        List<ADWorkScheduleResponse> responseList = schedules.stream().map(this::mapToResponse).collect(Collectors.toList());

        return ResponseObject.success(responseList, "Lấy danh sách lịch làm việc thành công");
    }

    @Override
    @Transactional
    public ResponseObject<?> assignShift(ADCreateScheduleRequest request) {
        //validate input
        if(request.getEmployeeId() == null || request.getShiftTemplateId() == null || request.getWorkDate() == null) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Dữ liệu đầu vào không được để trống");

        };

        //Kiểm tra trùng lịch
        boolean isDuplicate = adWorkScheduleRepository.existsByEmployee_IdAndShiftTemplate_IdAndWorkDate(request.getEmployeeId(), request.getShiftTemplateId(), request.getWorkDate());

        if(isDuplicate){
            return ResponseObject.error(HttpStatus.CONFLICT, "Nhân viên đã được phân ca này trong ngày đã chọn");
        }

        //Tìm nhân viên
        Employee employee = employeeRepository.findById(request.getEmployeeId()).orElse(null);
        if(employee == null){
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy nhân viên");
        }

        //Tìm shift template
        ShiftTemplate shiftTemplate = shiftTemplateRepository.findById(request.getShiftTemplateId()).orElse(null);

        if(shiftTemplate == null){
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy ca mẫu");
        }

        //Tạo entity
        try{
            WorkSchedule schedule = new WorkSchedule();
            schedule.setEmployee(employee);
            schedule.setShiftTemplate(shiftTemplate);
            schedule.setWorkDate(request.getWorkDate());
            schedule.setShiftStatus(ShiftStatus.REGISTERED);

            WorkSchedule savedSchedule = adWorkScheduleRepository.save(schedule);

            log.info("Đã phân ca {} ngày {} cho nhân viên {}",
                    shiftTemplate.getName(), request.getWorkDate(), employee.getCode());

            return ResponseObject.success(mapToResponse(savedSchedule), "Phân ca làm việc thành công");
        } catch(Exception e){
            log.error("Lỗi khi phân ca: {}", e.getMessage());
            return ResponseObject.error(HttpStatus.INTERNAL_SERVER_ERROR,"Lỗi hệ thống khi tạo lịch làm việc");
        }
    }

    @Override
    @Transactional
    public ResponseObject<?> deleteSchedule(String id) {
        //Tìm lịch
        WorkSchedule schedule = adWorkScheduleRepository.findById(id).orElse(null);

        if (schedule == null) {
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Lịch làm việc không tồn tại");
        }

        //Validate nghiệp vụ: Chỉ được xóa khi chưa Check-in (REGISTERED)
        if (schedule.getShiftStatus() != ShiftStatus.REGISTERED) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST,
                    "Không thể xóa ca làm việc đang diễn ra hoặc đã hoàn thành");
        }

        //Thực hiện xóa
        try {
            adWorkScheduleRepository.delete(schedule);
            log.info("Đã xóa lịch làm việc ID: {}", id);
            return ResponseObject.success(null, "Xóa lịch làm việc thành công");
        } catch (Exception e) {
            log.error("Lỗi xóa lịch: {}", e.getMessage());
            return ResponseObject.error(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi hệ thống khi xóa lịch");
        }
    }
}
