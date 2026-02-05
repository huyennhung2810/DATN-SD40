package com.example.datn.core.admin.vouchers.model;

import com.example.datn.infrastructure.constant.EntityStatus;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Data;


import java.math.BigDecimal;

@Data
@Builder
public class PostOrPutVoucherDto {
    private String id;

    @NotBlank(message = "Mã voucher không được để trống")
    @Size(max = 50, message = "Mã voucher không được quá 50 ký tự")
    private String voucherCode;

    @NotBlank(message = "Tên voucher không được để trống")
    @Size(max = 255, message = "Tên voucher không được quá 255 ký tự")
    private String voucherName;

    @NotBlank(message = "Loại voucher không được để trống")
    private String voucherType;

    @NotBlank(message = "Đơn vị giảm giá không được để trống")
    private String discountUnit;

    @NotNull(message = "Số tiền giảm tối đa không được để trống")
    @Positive(message = "Số tiền giảm tối đa phải lớn hơn 0")
    private BigDecimal maxDiscountAmount;

    @NotNull(message = "Điều kiện áp dụng không được để trống")
    @PositiveOrZero(message = "Điều kiện áp dụng không được là số âm")
    private BigDecimal conditions;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private Long startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private Long endDate;

    @Size(max = 255, message = "Ghi chú không được quá 255 ký tự")
    private String note;

    private Long createdAt;
    private Long updatedAt;

    @NotNull(message = "Trạng thái không được để trống")
    private EntityStatus status;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải ít nhất là 1")
    private Integer quantity;
}
