package com.example.datn.core.admin.techspec.model.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SaveProductTechSpecRequest {

    @NotBlank(message = "Thiếu productId")
    private String productId;
}
