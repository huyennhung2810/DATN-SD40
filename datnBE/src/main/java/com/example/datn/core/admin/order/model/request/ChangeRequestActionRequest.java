package com.example.datn.core.admin.order.model.request;

import com.example.datn.infrastructure.constant.ChangeRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChangeRequestActionRequest {
    private ChangeRequestStatus action;
    private String adminNote;
}
