package com.example.datn.core.admin.product.model.response;

import com.example.datn.core.admin.techspec.model.response.ADTechSpecResponse;
import com.example.datn.core.common.base.IsIdentify;
import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ADProductResponse implements IsIdentify {
    
    private String id;
    
    private String name;
    
    private String description;
    
    private String idProductCategory;
    
    private String productCategoryName;
    
    private String idBrand;
    
    private String brandName;
    
    private String idTechSpec;
    
    private String techSpecName;

    private BigDecimal price;

    /** Giá gốc (chưa giảm) - dùng để hiển thị khi có đợt giảm giá */
    private BigDecimal originalPrice;
    
    // techSpec
    private ADTechSpecResponse techSpec;
    
    private EntityStatus status;
    
    private Long createdDate;
    
    private Long lastModifiedDate;
    
    // Danh sách URL ảnh
    private List<String> imageUrls;

    /** Thông số kỹ thuật động (nhóm định nghĩa) — key: spec_{definitionCode} */
    private Map<String, Object> techSpecDynamic;

    /** Số lượng biến thể (variant) của sản phẩm */
    private Integer variantCount;

    /**
     * True nếu biến thể có giá gốc nhỏ nhất đang có đợt giảm giá active.
     * Frontend dùng field này thay vì threshold cứng để hiển thị badge giảm giá.
     */
    private Boolean hasActiveSaleCampaign;
}