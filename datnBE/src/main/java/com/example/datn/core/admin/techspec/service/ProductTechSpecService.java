package com.example.datn.core.admin.techspec.service;

import com.example.datn.core.admin.techspec.model.response.ProductTechSpecValueResponse;

import java.util.List;
import java.util.Map;

public interface ProductTechSpecService {

    List<ProductTechSpecValueResponse> getByProductId(String productId);

    Map<String, String> getProductSpecValues(String productId);

    /**
     * Giá trị cho form Ant Design: NUMBER là số, còn lại là chuỗi (key: spec_{code})
     */
    Map<String, Object> getProductSpecFormValues(String productId);

    void saveProductSpecValues(String productId, Map<String, String> values);
}
