package com.example.datn.core.client.product.model.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CnVariantResponse {
    private String id; // ĐÂY CHÍNH LÀ ID CỦA PRODUCT DETAIL (Dùng để thêm vào giỏ)
    private String name; // Tên biến thể (VD: "Body Only / Đen / 128GB")
    private BigDecimal salePrice; // Giá gốc (salePrice từ ProductDetail)

    /**
     * Giá gốc = salePrice.
     * Dùng khi có giảm giá để hiển thị giá cũ gạch ngang.
     */
    private BigDecimal originalPrice;

    /**
     * Giá sau khi áp dụng giảm giá. Null nếu không có đợt giảm giá active.
     */
    private BigDecimal discountedPrice;

    /**
     * Giá hiển thị trên UI = discountedPrice (nếu có) hoặc salePrice.
     */
    private BigDecimal displayPrice;

    /**
     * True nếu variant này đang trong đợt giảm giá hợp lệ.
     */
    private Boolean hasActiveSaleCampaign;

    private Integer stock; // Số lượng tồn kho
}
