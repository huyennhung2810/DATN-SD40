package com.example.datn.core.admin.customer.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ADAddressRequest {

    private String id;

    @NotBlank(message = "Tên người nhận không được để trống")
    @Size(max = 100, message = "Tên người nhận tối đa 100 ký tự")
    private String name;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(
            regexp = "^0\\d{9}$",
            message = "Số điện thoại phải bắt đầu bằng 0 và gồm 10 chữ số"
    )
    private String phoneNumber;

    @NotBlank(message = "Tỉnh/Thành phố không được để trống")
    @Size(max = 100, message = "Tỉnh/Thành phố tối đa 100 ký tự")
    private String provinceCity;


    @NotBlank(message = "Phường/Xã không được để trống")
    @Size(max = 100, message = "Phường/Xã tối đa 100 ký tự")
    private String wardCommune;

    private Integer provinceCode;

    private Integer wardCode;

    @NotBlank(message = "Địa chỉ chi tiết không được để trống")
    @Size(max = 255, message = "Địa chỉ chi tiết tối đa 255 ký tự")
    private String addressDetail;


    @NotNull(message = "Trạng thái địa chỉ mặc định không được để trống")
    private Boolean isDefault;
}
