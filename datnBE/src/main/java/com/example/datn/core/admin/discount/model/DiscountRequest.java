package com.example.datn.core.admin.discount.model;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor // Cần thiết để các thư viện khác hoạt động
@AllArgsConstructor
public class DiscountRequest {
    @NotBlank(message = "Mã không được để trống")
    private String code;

    @NotBlank(message = "Tên không được để trống")
    private String name;

    @Min(value = 1, message = "Giảm giá tối thiểu 1%")
    @Max(value = 100, message = "Giảm giá tối đa 100%")
    private BigDecimal discountPercent;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private Long startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private Long endDate;

    private Integer quantity;
    private String note;
    private Integer status;
    private List<String> productDetailIds;
}
