package com.example.datn.core.client.product.model.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class CnProductResponse {
    private String id;
    private String name;
    private String description;

    /**
     * Giá hiển thị cuối cùng = giá sau giảm (nếu có campaign) hoặc giá gốc.
     * Đây là giá KHÁCH HÀNG THẤY trên trang client.
     */
    private BigDecimal displayPrice;

    /**
     * Giá gốc của biến thể có giá gốc nhỏ nhất (chưa giảm).
     * Dùng để hiển thị khi có đợt giảm giá.
     */
    private BigDecimal originalPrice;

    /**
     * ID của biến thể có giá gốc nhỏ nhất.
     */
    private String cheapestVariantId;

    /**
     * True nếu biến thể rẻ nhất đang có đợt giảm giá active.
     * Frontend dùng field này để hiển thị badge giảm giá.
     */
    private Boolean hasActiveSaleCampaign;

    /**
     * Số tiền giảm (originalPrice - displayPrice).
     */
    private BigDecimal discountAmount;

    /**
     * Phần trăm giảm giá (ví dụ: 10.0 cho 10%).
     */
    private BigDecimal discountPercent;

    private List<String> images;

    private List<CnVariantResponse> variants;
    // 1. Khai báo danh sách thông số kỹ thuật trả về cho Frontend
    private List<TechSpecDto> specifications;

    // 2. Tạo một DTO nhỏ bên trong (hoặc tạo file TechSpecDto.java riêng lẻ tùy bạn) để chứa cặp Tên - Giá trị
    @Getter
    @Setter
    public static class TechSpecDto {
        private String name;
        private String value;

        public TechSpecDto(String name, String value) {
            this.name = name;
            this.value = value;
        }
    }
}
