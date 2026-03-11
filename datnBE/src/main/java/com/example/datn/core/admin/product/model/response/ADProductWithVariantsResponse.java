package com.example.datn.core.admin.product.model.response;

import com.example.datn.core.admin.techspec.model.response.ADTechSpecResponse;
import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ADProductWithVariantsResponse {

    // Thông tin sản phẩm cha
    private String id;
    private String name;
    private String description;
    private String idProductCategory;
    private String productCategoryName;
    private String idTechSpec;
    private String techSpecName;
    private BigDecimal price;
    private EntityStatus status;
    private Long createdDate;
    private Long lastModifiedDate;
    private List<String> imageUrls;
    private ADTechSpecResponse techSpec;

    // Danh sách ảnh của sản phẩm mẹ (để chọn cho biến thể)
    private List<ADProductImageSimpleResponse> productImages;

    // Thông tin tổng hợp từ các biến thể con
    private Integer totalQuantity;       // Tổng tồn kho từ các biến thể
    private BigDecimal minPrice;        // Giá thấp nhất từ các biến thể
    private BigDecimal maxPrice;        // Giá cao nhất từ các biến thể
    private Integer variantCount;       // Số lượng biến thể

    // Danh sách biến thể con
    private List<ADProductVariantResponse> variants;
}
