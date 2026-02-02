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
import com.example.datn.infrastructure.email.EmailService;
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
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Optional;
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
    private final EmailService emailService;

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

        String plainPassword = DataGeneratorUtils.generateRandomPassword(10);

        long count = employeeRepository.count();
        String generatedCode = DataGeneratorUtils.generateStaffCode(request.getName(), count);

        while (accountRepository.existsByUsername(generatedCode)) {
            count++;
            generatedCode = DataGeneratorUtils.generateStaffCode(request.getName(), count);
        }

        try {
            String[] hashResult = SecurityUtils.hashPassword(plainPassword);
            String salt = hashResult[0];
            String hashedPassword = hashResult[1];

            Account account = new Account();
            account.setUsername(generatedCode);
            account.setPassword(hashedPassword); // Lưu Hash
            account.setSalt(salt);               // Lưu Salt

            RoleConstant role = RoleConstant.STAFF;
            if (StringUtils.hasText(request.getRole())) {
                role = RoleConstant.valueOf(request.getRole().toUpperCase());
            }
            account.setRole(role);
            account.setStatus(EntityStatus.ACTIVE);
            Account savedAccount = accountRepository.save(account);

            Employee employee = new Employee();
            employee.setAccount(savedAccount);
            employee.setCode(generatedCode);
            employee.setStatus(EntityStatus.ACTIVE);

            mapRequestToResponse(request, employee);
            handleUpLoadImage(request, employee);
            Employee savedEmployee = employeeRepository.save(employee);

            emailService.sendAccountEmail(
                    request.getEmail(),
                    request.getName(),
                    generatedCode,
                    generatedCode,
                    plainPassword
            );

            return ResponseObject.success(savedEmployee, "Thêm nhân viên và gửi mail thành công!");

        } catch (Exception e) {
            log.error("Lỗi bảo mật hoặc gửi mail: {}", e.getMessage());
            throw new RuntimeException("Quá trình tạo nhân viên thất bại");
        }
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


            if (StringUtils.hasText(request.getPassword())) {
                try {
                    String[] hashResult = SecurityUtils.hashPassword(request.getPassword());
                    account.setSalt(hashResult[0]);
                    account.setPassword(hashResult[1]);
                } catch (Exception e) {
                    log.error("Lỗi hash mật khẩu khi cập nhật: {}", e.getMessage());
                    throw new RuntimeException("Lỗi hệ thống khi mã hóa mật khẩu");
                }
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

    @Transactional
    @Override
    public ResponseObject<?> resetPasswordWithOTP(String email, String otpInput, String newPassword) {
        // 1. Tìm tài khoản dựa trên Email người dùng nhập
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không hợp lệ"));

        Account account = employee.getAccount();

        // 2. Kiểm tra mã OTP trong DB
        if (account.getOtpCode() == null || !account.getOtpCode().equals(otpInput)) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Mã OTP không chính xác");
        }

        // 3. Kiểm tra thời gian hết hạn
        if (System.currentTimeMillis() > account.getOtpExpiryTime()) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Mã OTP đã hết hạn hiệu lực");
        }

        try {
            // 4. Hash mật khẩu mới bằng PBKDF2 (SecurityUtils)
            String[] hashResult = SecurityUtils.hashPassword(newPassword);
            account.setSalt(hashResult[0]);
            account.setPassword(hashResult[1]);

            // 5. Xóa mã OTP sau khi đổi thành công để bảo mật
            account.setOtpCode(null);
            account.setOtpExpiryTime(null);

            accountRepository.save(account);
            return ResponseObject.success(null, "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
        } catch (Exception e) {
            log.error("Lỗi xác thực PBKDF2: {}", e.getMessage());
            return ResponseObject.error(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi hệ thống khi đổi mật khẩu");
        }
    }

    @Transactional
    @Override
    public ResponseObject<?> requestForgotPassword(String email) {
        // 1. Tìm nhân viên theo email
        Optional<Employee> employeeOptional = employeeRepository.findByEmail(email);

        // Bây giờ gọi orElseThrow chắc chắn sẽ nhận diện được
        Employee employee = employeeOptional.orElseThrow(() ->
                new RuntimeException("Email không tồn tại trên hệ thống"));
        Account account = employee.getAccount();
        if (account == null) {
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Tài khoản không tồn tại");
        }

        // 2. Sinh mã OTP và thời gian hết hạn (5 phút)
        String otp = DataGeneratorUtils.generateOTP();
        Long expiryTime = System.currentTimeMillis() + (5 * 60 * 1000);

        // 3. Lưu OTP vào Account (Cần đảm bảo Entity Account đã có 2 trường này)
        account.setOtpCode(otp);
        account.setOtpExpiryTime(expiryTime);
        accountRepository.save(account);

        // 4. Gửi Email (Sử dụng template Hikari Camera bạn đã viết)
        emailService.sendOtpEmail(employee.getEmail(), employee.getName(), otp);

        log.info("Đã gửi OTP quên mật khẩu cho: {}", email);
        return ResponseObject.success(null, "Mã OTP đã được gửi đến email của bạn");
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
                e.getDateOfBirth() != null
                        ? new SimpleDateFormat("dd/MM/yyyy").format(e.getDateOfBirth())
                        : "---",                e.getIdentityCard() != null ? e.getIdentityCard() : "---",
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

    // Thêm vào trong ADEmployeeServiceImpl.java

    @Transactional
    @Override
    public ResponseObject<?> changePassword(String username, com.example.datn.core.admin.Employee.model.request.ADChangePasswordRequest request) {
        Account account = accountRepository.findByUsername(username);

        if (account == null) {
            throw new RuntimeException("Tài khoản không tồn tại");
        }

        try {
            // Kiểm tra mật khẩu cũ (Mật khẩu gửi trong email)
            boolean isMatch = SecurityUtils.verifyPassword(
                    request.getOldPassword(),
                    account.getSalt(),
                    account.getPassword()
            );

            if (!isMatch) {
                return ResponseObject.error(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không chính xác");
            }

            // Hash mật khẩu mới
            String[] hashResult = SecurityUtils.hashPassword(request.getNewPassword());
            account.setSalt(hashResult[0]);
            account.setPassword(hashResult[1]);

            //Lưu thay đổi
            accountRepository.save(account);

            log.info("Nhân viên {} đã đổi mật khẩu thành công", username);
            return ResponseObject.success(null, "Đổi mật khẩu thành công");

        } catch (Exception e) {
            log.error("Lỗi khi xác thực hoặc mã hóa mật khẩu: {}", e.getMessage());
            return ResponseObject.error(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi hệ thống khi xử lý mật khẩu");
        }
    }
}
