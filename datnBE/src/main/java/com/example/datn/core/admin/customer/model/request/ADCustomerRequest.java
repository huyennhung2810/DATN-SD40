package com.example.datn.core.admin.customer.model.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class ADCustomerRequest {

    private String id;
    private String code;

    @NotBlank(message = "Tên khách hàng không được để trống")
    @Size(max = 100, message = "Tên khách hàng tối đa 100 ký tự")
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

    //image
    private MultipartFile image;

    private List<ADAddressRequest> addresses;
}
