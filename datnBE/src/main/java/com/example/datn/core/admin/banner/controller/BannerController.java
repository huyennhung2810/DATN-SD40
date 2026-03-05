package com.example.datn.core.admin.banner.controller;

import com.example.datn.core.admin.banner.model.response.ADBannerResponse;
import com.example.datn.core.admin.banner.service.ADBannerService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.MappingConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(MappingConstants.CUSTOMER_BANNER)
@RequiredArgsConstructor
public class BannerController {

    private final ADBannerService bannerService;

    /**
     * Get active banners for customer
     * Returns banners that are:
     * - Status = ACTIVE
     * - Current time is between startAt and endAt (if specified)
     * Ordered by priority DESC, createdDate DESC
     *
     * @param position the banner position (e.g., "HOME_TOP"). If null, returns all positions.
     * @return list of active banners
     */
    @GetMapping("/active")
    public ResponseObject<List<ADBannerResponse>> getActiveBanners(
            @RequestParam(required = false) String position) {
        return ResponseObject.<List<ADBannerResponse>>builder()
                .isSuccess(true)
                .status(HttpStatus.OK)
                .data(bannerService.findActiveBanners(position))
                .message("Lấy danh sách banner thành công")
                .build();
    }
}
