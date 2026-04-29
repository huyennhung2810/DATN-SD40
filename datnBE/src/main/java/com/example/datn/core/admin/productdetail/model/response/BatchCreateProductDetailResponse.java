package com.example.datn.core.admin.productdetail.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BatchCreateProductDetailResponse {

    private boolean success;
    private String message;
    private int totalRequested;
    private int totalCreated;
    private List<BatchCreatedItem> createdItems;
    private List<BatchCreateError> errors;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BatchCreatedItem {
        private int rowIndex;
        private String id;
        private String code;
        private String version;
        private String colorName;
        private String storageCapacityName;
        private int serialCount;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BatchCreateError {
        private int rowIndex;
        private String field;
        private String code;
        private String message;
    }
}
