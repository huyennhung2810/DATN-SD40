package com.example.datn.core.admin.discountDetail.model;

import com.example.datn.entity.DiscountDetail;
import com.example.datn.entity.VoucherDetail;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscountDetailResponse {
    private String id;
    private String productDetailId;
    private String productName; // Tên máy ảnh
    private BigDecimal priceBefore;
    private BigDecimal priceAfter;
    private Integer status;

    public DiscountDetailResponse(DiscountDetail entity) {
        this.id = entity.getId();
        this.productDetailId = entity.getProductDetail().getId();

        // Kiểm tra null an toàn cho Product và Color
        String productName = "N/A";
        if (entity.getProductDetail().getProduct() != null) {
            productName = entity.getProductDetail().getProduct().getName();
        }

        String colorName = "N/A";
        if (entity.getProductDetail().getColor() != null) {
            colorName = entity.getProductDetail().getColor().getName();
        }

        this.productName = productName + " [" + colorName + "]";
        this.priceBefore = entity.getPriceBefore();
        this.priceAfter = entity.getPriceAfter();
    }
}
