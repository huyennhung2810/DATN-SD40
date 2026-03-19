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
    private BigDecimal price; // Giá hiển thị mặc định
    private List<String> images; // Danh sách link ảnh
    private List<CnVariantResponse> variants; // Danh sách các biến thể (Màu sắc, dung lượng...)
}
