package com.example.datn.core.client.product.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Response DTO for related products endpoint.
 * Contains all fields needed for client-side related product card display.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RelatedProductResponse {

    private String productId;
    private String productName;
    private String slug;
    private String thumbnail;
    private String brand;
    private String brandId;
    private String category;
    private String categoryId;

    /** Giá gốc chưa giảm của biến thể rẻ nhất. */
    private BigDecimal originalPrice;

    /** Giá hiển thị thực tế (sau giảm giá nếu có). */
    private BigDecimal displayPrice;

    /** True nếu đang có đợt giảm giá active. */
    private Boolean hasActiveSaleCampaign;

    /** Phần trăm giảm giá (ví dụ: 10.0 cho 10%). */
    private BigDecimal discountPercent;

    /** Tổng hợp các thông số kỹ thuật nổi bật dùng cho scoring display. */
    private TechSummary techSummary;

    /**
     * Lý do đề xuất hiển thị ở frontend.
     * Ví dụ: "Cùng cảm biến Full Frame, cùng ngàm RF"
     *         "Cùng phân khúc giá dưới 30 triệu"
     */
    private List<String> matchReasons;

    /** ============================================================
     *  Nested DTOs
     *  ============================================================ */

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TechSummary {
        private String sensorType;
        private String lensMount;
        private String resolution;
        private String processor;
        private String videoFormat;
        private String iso;
        private String imageFormat;
    }
}
