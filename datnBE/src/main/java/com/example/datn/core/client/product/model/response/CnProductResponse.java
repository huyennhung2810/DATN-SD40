package com.example.datn.core.client.product.model.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
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

    /**
     * Thông số kỹ thuật đầy đủ (cố định + động).
     * Sử dụng field này thay cho specifications (list phẳng).
     */
    private TechSpecDetail techSpec;

    /**
     * @deprecated Dùng techSpec.fixedSpecs và techSpec.dynamicSpecs thay cho list phẳng này.
     */
    @Deprecated
    private List<TechSpecDto> specifications;

    // =============================================
    // Nested DTOs for structured tech spec response
    // =============================================

    @Getter
    @Setter
    public static class TechSpecDetail {
        private FixedSpecs fixedSpecs;
        private List<DynamicSpecGroup> dynamicSpecs;
    }

    @Getter
    @Setter
    public static class FixedSpecs {
        private String sensorType;
        private String lensMount;
        private String resolution;
        private String iso;
        private String processor;
        private String imageFormat;
        private String videoFormat;
    }

    @Getter
    @Setter
    public static class DynamicSpecGroup {
        private String groupId;
        private String groupName;
        private Integer groupOrder;
        private List<SpecItem> items;

        public DynamicSpecGroup(String groupId, String groupName, Integer groupOrder) {
            this.groupId = groupId;
            this.groupName = groupName;
            this.groupOrder = groupOrder;
            this.items = new ArrayList<>();
        }
    }

    @Getter
    @Setter
    public static class SpecItem {
        private String definitionId;
        private String definitionName;
        private String value;
        private String unit;
        private Integer displayOrder;

        public SpecItem(String definitionId, String definitionName, String value, String unit, Integer displayOrder) {
            this.definitionId = definitionId;
            this.definitionName = definitionName;
            this.value = value;
            this.unit = unit;
            this.displayOrder = displayOrder;
        }
    }

    /**
     * @deprecated Dùng TechSpecDetail thay cho DTO phẳng này.
     */
    @Getter
    @Setter
    @Deprecated
    public static class TechSpecDto {
        private String name;
        private String value;

        public TechSpecDto(String name, String value) {
            this.name = name;
            this.value = value;
        }
    }
}