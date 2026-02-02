package com.example.datn.core.admin.Employee.model.response;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ADEmployeeResponse {
    private String id;
    private String code;
    private String name;
    private String email;
    private String phoneNumber;
    private Boolean gender;
    private Long dateOfBirth;
    private String identityCard;
    private String username;
    private String hometown;
    private String employeeImage;
    private String status;
    private Long createdDate;
    private String provinceCity;
    private String wardCommune;
    private Integer provinceCode;
    private Integer wardCode;
    private String salt;
    private String role;
}
