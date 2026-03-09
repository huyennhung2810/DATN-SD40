package com.example.datn.dto.banner;

import com.example.datn.infrastructure.constant.BannerPosition;
import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BannerSearchRequest {

    private Integer page = 0;

    private Integer size = 10;

    private String keyword;

    private EntityStatus status;

    private BannerPosition position;

    private LocalDateTime startDateFrom;

    private LocalDateTime startDateTo;

    private String sortBy = "priority";

    private String sortDirection = "DESC";
}
