package com.example.datn.core.admin.statitics.controller;

import com.example.datn.core.admin.statitics.model.response.*;
import com.example.datn.core.admin.statitics.service.ADStatisticsService;
import com.example.datn.infrastructure.constant.MappingConstants;
import com.example.datn.infrastructure.constant.TimeRangeType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(MappingConstants.API_ADMIN_PREFIX_STATISTICS)
@RequiredArgsConstructor
@Slf4j
public class ADStatisticsController {

    private final ADStatisticsService adStatisticsService;

    @GetMapping("/overview")
    public ResponseEntity<?> getDashboardOverview() {
        return ResponseEntity.ok(adStatisticsService.getAdminDashboardOverview());
    }


}
