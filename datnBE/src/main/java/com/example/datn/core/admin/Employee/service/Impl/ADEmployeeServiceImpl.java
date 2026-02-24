package com.example.datn.core.admin.Employee.service.Impl;

import com.example.datn.core.admin.Employee.model.request.ADEmployeeRequest;
import com.example.datn.core.admin.Employee.model.request.ADEmployeeSearchRequest;
import com.example.datn.core.admin.Employee.repository.ADEmployeeRepository;
import com.example.datn.core.admin.Employee.service.ADEmployeeService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.Account;
import com.example.datn.entity.Employee;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.RoleConstant;
import com.example.datn.repository.AccountRepository;
import com.example.datn.utils.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ADEmployeeServiceImpl implements ADEmployeeService {
    private final ADEmployeeRepository employeeRepository;
    private final CloudinaryUtils cloudinaryUtils;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    private void mapRequestToResponse(ADEmployeeRequest req, Employee employee) {
        employee.setCode(req.getCode());
        employee.setName(req.getName());
        employee.setEmail(req.getEmail());
        employee.setPhoneNumber(req.getPhoneNumber());
        employee.setGender(req.getGender());
        employee.setDateOfBirth(req.getDateOfBirth());
        employee.setIdentityCard(req.getIdentityCard());
        employee.setHometown(req.getHometown());
        employee.setProvinceCity(req.getProvinceCity());
        employee.setWardCommune(req.getWardCommune());
        employee.setWardCode(req.getWardCode());
        employee.setProvinceCode(req.getProvinceCode());
    }

    private void handleUpLoadImage(ADEmployeeRequest req, Employee employee) {
        if (req.getEmployeeImage() == null || req.getEmployeeImage().isEmpty()) return;

        FileUploadUtils.assertAllowed(req.getEmployeeImage(), FileUploadUtils.IMAGE_PATTERN);

        try {
            // Xóa ảnh cũ nếu đã có ảnh trên hệ thống
            if (StringUtils.hasText(employee.getEmployeeImage())) {
                cloudinaryUtils.deleteImage(employee.getEmployeeImage());
            }

            // Upload ảnh mới: Đặt tên folder là 'employees' và publicId dựa trên mã NV hoặc Email
            String imageUrl = cloudinaryUtils.uploadImage(
                    req.getEmployeeImage().getBytes(),
                    "employees/" + (employee.getCode() != null ? employee.getCode() : System.currentTimeMillis())
            );
            employee.setEmployeeImage(imageUrl);
        } catch (IOException e) {
            log.error("Lỗi upload ảnh nhân viên: {}", e.getMessage());
            throw new RuntimeException("Lỗi upload ảnh nhân viên", e);
        }
    }

    @Override
    public ResponseObject<?> getAllEmployee(ADEmployeeSearchRequest request) {
        Pageable pageable = Helper.createPageable(request);

        RoleConstant roleEnum = null;
        if (StringUtils.hasText(request.getRole())) {
            try {
                roleEnum = RoleConstant.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Role filter không hợp lệ: {}", request.getRole());
            }
        }

        Page<Employee> page = employeeRepository.getAllEmployee(
                pageable,
                request.getKeyword(),
                request.getStatus(),
                request.getGender(),
                roleEnum
        );

        return  ResponseObject.success(PageableObject.of(page), "Lấy danh sách nhân viên thành công");
    }

    @Override
    public ResponseObject<?> getEmployeeById(String id) {
        return employeeRepository.findById(id)
                .map(e -> ResponseObject.success(e, "Lấy nhân viên thành công"))
                .orElse(ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy nhân viên"));
    }

    @Override
    public ResponseObject<?> addEmployee(ADEmployeeRequest request) {
        if (!StringUtils.hasText(request.getPassword())) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Mật khẩu không được để trống");
        }

        //Tạo và lưu Account
        Account account = new Account();
        account.setUsername(request.getUsername());
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        RoleConstant role = RoleConstant.STAFF;
        if (StringUtils.hasText(request.getRole())) {
            try {
                role = RoleConstant.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseObject.error(HttpStatus.BAD_REQUEST, "Role không hợp lệ");
            }
        }
        account.setRole(role);

        account.setStatus(EntityStatus.ACTIVE);
        Account savedAccount = accountRepository.save(account);

        //Tạo Employee
        Employee employee = new Employee();
        employee.setAccount(savedAccount);
        employee.setStatus(EntityStatus.ACTIVE);

        mapRequestToResponse(request, employee);
        handleUpLoadImage(request, employee);

        Employee savedEmployee = employeeRepository.save(employee);
        return ResponseObject.success(savedEmployee, "Thêm nhân viên thành công");
    }

    @Override
    public ResponseObject<?> updateEmployee(ADEmployeeRequest request) {
        //  Kiểm tra ID nhân viên
        if (!StringUtils.hasText(request.getId())) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Thiếu ID nhân viên");
        }

        // Tìm Employee hiện tại
        Employee employee = employeeRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên"));

        // Cập nhật thông tin Account liên quan
        Account account = employee.getAccount();
        if (account != null) {
            if (StringUtils.hasText(request.getUsername())
                    && !account.getUsername().equals(request.getUsername())) {

                if (accountRepository.existsByUsername(request.getUsername())) {
                    return ResponseObject.error(HttpStatus.BAD_REQUEST, "Username đã tồn tại trên hệ thống");
                }
                account.setUsername(request.getUsername());
            }


            // Chỉ cập nhật mật khẩu nếu người dùng nhập mật khẩu mới (không trống)
            if (StringUtils.hasText(request.getPassword())) {
                account.setPassword(passwordEncoder.encode(request.getPassword()));
            }

            if (StringUtils.hasText(request.getRole())) {
                try {
                    account.setRole(RoleConstant.valueOf(request.getRole().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    return ResponseObject.error(HttpStatus.BAD_REQUEST, "Role không hợp lệ");
                }
            }

            accountRepository.save(account);
        }

        //Map thông tin cá nhân của Employee
        mapRequestToResponse(request, employee);

        // Xử lý ảnh (Upload mới/Xóa cũ)
        handleUpLoadImage(request, employee);

        //Lưu thay đổi
        Employee savedEmployee = employeeRepository.save(employee);

        return ResponseObject.success(
                savedEmployee,
                "Cập nhật thông tin và tài khoản nhân viên thành công"
        );
    }

    @Override
    @Transactional
    public ResponseObject<?> changeEmployeeStatus(String id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên"));

        EntityStatus newStatus = (employee.getStatus() == EntityStatus.ACTIVE)
                ? EntityStatus.INACTIVE : EntityStatus.ACTIVE;

        employee.setStatus(newStatus);

        // Đồng bộ trạng thái của Account đi kèm
        if (employee.getAccount() != null) {
            employee.getAccount().setStatus(newStatus);
            accountRepository.save(employee.getAccount());
        }

        employeeRepository.save(employee);
        return ResponseObject.success(null, "Đổi trạng thái thành công");
    }

    @Override
    public ResponseObject<?> changeEmployeeRole(String id) {
        return null;
    }


    @Override
    public byte[] exportAllEmployees() {
        List<String> headers = List.of(
                "STT", "Mã NV", "Họ Tên", "Email", "Số điện thoại",
                "Giới tính", "Ngày sinh", "Số CCCD", "Quê quán",
                "Tỉnh/Thành phố", "Phường/Xã", "Trạng thái"
        );

        List<Employee> employees = employeeRepository.findAll();
        AtomicInteger index = new AtomicInteger(1);


        List<List<Object>> data = employees.stream().map(e -> List.<Object>of(
                index.getAndIncrement(),
                e.getCode() != null ? e.getCode() : "---",
                e.getName() != null ? e.getName() : "---",
                e.getEmail() != null ? e.getEmail() : "---",
                e.getPhoneNumber() != null ? e.getPhoneNumber() : "---",
                e.getGender() != null ? (e.getGender() ? "Nam" : "Nữ") : "Khác",
                e.getDateOfBirth() != null ? DateConverter.convertDateToString(e.getDateOfBirth()) : "---",
                e.getIdentityCard() != null ? e.getIdentityCard() : "---",
                e.getHometown() != null ? e.getHometown() : "---",
                e.getProvinceCity() != null ? e.getProvinceCity() : "---",
                e.getWardCommune() != null ? e.getWardCommune() : "---",
                e.getStatus() != null ? (e.getStatus().equals(EntityStatus.ACTIVE) ? "Hoạt động" : "Ngừng") : "---"
        )).collect(Collectors.toList());

        return ExcelHelper.createExcelStream("Danh sách nhân viên", headers, data);
    }

    @Override
    public ResponseObject<?> checkDuplicate(String identityCard, String phoneNumber, String email, String id, String username) {
        String safeId = (id == null || id.equalsIgnoreCase("undefined") || id.equalsIgnoreCase("null")) ? "" : id;

        if (StringUtils.hasText(identityCard)) {
            if (employeeRepository.existsByIdentityCardCustom(identityCard, id))
                return ResponseObject.success(true, "Số CCCD đã tồn tại");
        }

        if (StringUtils.hasText(phoneNumber)) {
            if (employeeRepository.existsByPhoneNumberCustom(phoneNumber, id))
                return ResponseObject.success(true, "Số điện thoại đã tồn tại");
        }

        if (StringUtils.hasText(email)) {
            if (employeeRepository.existsByEmailCustom(email, id))
                return ResponseObject.success(true, "Email đã tồn tại");
        }

        if (StringUtils.hasText(username)) {
            boolean exists = employeeRepository.existsByUsernameCustom(username, safeId);
            if (exists) return ResponseObject.success(true, "Tên đăng nhập đã tồn tại");
        }

        return ResponseObject.success(false, "Dữ liệu hợp lệ");
    }
}
