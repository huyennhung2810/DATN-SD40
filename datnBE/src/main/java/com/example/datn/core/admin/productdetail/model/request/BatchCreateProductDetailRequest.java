package com.example.datn.core.admin.productdetail.model.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class BatchCreateProductDetailRequest {

    @NotNull(message = "Danh sách biến thể không được để trống")
    @NotEmpty(message = "Danh sách biến thể không được rỗng")
    @Valid
    private List<BatchCreateProductDetailItemRequest> items;
}
