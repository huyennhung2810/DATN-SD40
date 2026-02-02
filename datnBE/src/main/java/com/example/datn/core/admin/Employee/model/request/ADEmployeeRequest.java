package com.example.datn.core.admin.Employee.model.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ADEmployeeRequest {
    private String id;
    private String code;

    @NotBlank(message = "Tên nhân viên không được để trống")
    @Size(max = 100, message = "Tên nhân viên tối đa 100 ký tự")
    private String name;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(
            regexp = "^0\\d{9}$",
            message = "Số điện thoại phải bắt đầu bằng 0 và gồm 10 chữ số"
    )
    private String phoneNumber;

    @NotNull(message = "Giới tính không được để trống")
    private Boolean gender;

    @NotNull(message = "Ngày sinh không được để trống")
    @Positive(message = "Ngày sinh không hợp lệ")
    private Long dateOfBirth;

    @NotBlank(message = "CCCD không được để trống")
    @Pattern(
            regexp = "^\\d{12}$",
            message = "CCCD phải gồm đúng 12 chữ số"
    )
    private String identityCard;

    //account info
    private String username;

    private String password;

    private String role;

    @NotBlank(message = "Quê quán không được để trống")
    @Size(max = 100, message = "Quê quán tối đa 100 ký tự")
    private String hometown;

    private String provinceCity;

    private String wardCommune;

    private Integer provinceCode;
    private Integer wardCode;

    //image
    private MultipartFile employeeImage;
}
