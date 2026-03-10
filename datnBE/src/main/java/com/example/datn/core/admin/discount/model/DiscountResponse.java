package com.example.datn.core.admin.discount.model;

import com.example.datn.core.admin.discountDetail.model.DiscountDetailResponse;
import com.example.datn.entity.Discount;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor // Cần thiết để các thư viện khác hoạt động
@AllArgsConstructor
public class DiscountResponse {
    private String id;
    private String code;
    private String name;
    private Double discountPercent;
    private Long startDate;
    private Long endDate;
    private String note;
    private Integer quantity;
    private Integer status;
    private Long createdAt;
    private Long updatedAt;
    private String createdBy;
    private String updatedBy;
    private List<DiscountDetailResponse> discountDetails;

    public DiscountResponse(Discount discount) {
        this.id = discount.getId();
        this.code = discount.getCode();
        this.name = discount.getName();
        this.discountPercent = discount.getDiscountPercent() != null ? discount.getDiscountPercent().doubleValue() : 0.0;
        this.startDate = discount.getStartDate();
        this.endDate = discount.getEndDate();
        this.note = discount.getNote();
        this.quantity = discount.getQuantity();
        this.status = discount.getStatus();
        this.createdAt = discount.getCreatedAt();
        this.updatedAt = discount.getUpdatedAt();
        this.createdBy = discount.getCreatedBy();
        this.updatedBy = discount.getUpdatedBy();
    }
}
