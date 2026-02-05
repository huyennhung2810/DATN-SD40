package com.example.datn.core.admin.discount.model;

import com.example.datn.infrastructure.constant.EntityStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PostOrPutDiscountDto {
    private String id;

    @NotBlank(message = "Mã giảm giá không được để trống")
    private String code;

    @NotBlank(message = "Tên đợt giảm giá không được để trống")
    private String name;

    @NotNull(message = "Phần trăm giảm không được để trống")
    @Min(value = 1, message = "Giảm tối thiểu 1%")
    @Max(value = 100, message = "Giảm tối đa 100%")
    private BigDecimal discountPercent;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private Long startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private Long endDate;

    private String note;
    @NotNull(message = "Trạng thái không được để trống")
    private EntityStatus status;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải ít nhất là 1")
    private Integer quantity;
}
