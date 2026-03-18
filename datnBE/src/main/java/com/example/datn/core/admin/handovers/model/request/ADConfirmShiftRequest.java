package com.example.datn.core.admin.handovers.model.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ADConfirmShiftRequest {
    @NotBlank(message = "ID ca trực không được để trống")
    private String handoverId;

    private String adminNote;
}
