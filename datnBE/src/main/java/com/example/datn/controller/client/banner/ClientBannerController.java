package com.example.datn.controller.client.banner;

import com.example.datn.dto.banner.BannerResponse;
import com.example.datn.infrastructure.constant.BannerPosition;
import com.example.datn.service.banner.BannerService;
import com.example.datn.core.common.base.ResponseObject;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/client/banners")
@RequiredArgsConstructor
public class ClientBannerController {

    private final BannerService bannerService;

    /**
     * Get active banners for client by position
     * Returns banners that are:
     * - Status = ACTIVE
     * - Current time is between startAt and endAt (if specified)
     * - Position matches (if specified)
     * Ordered by priority ASC, createdDate DESC
     *
     * @param position the banner position (e.g., "HOME_HERO"). If null, returns all positions.
     * @return list of active banners
     */
    @GetMapping("/active")
    public ResponseObject<List<BannerResponse>> getActiveBanners(
            @RequestParam(required = false) String position) {
        BannerPosition bannerPosition = null;
        if (position != null && !position.isEmpty()) {
            try {
                bannerPosition = BannerPosition.fromValue(position);
            } catch (IllegalArgumentException e) {
                // Invalid position, return empty list
                return ResponseObject.<List<BannerResponse>>builder()
                        .isSuccess(true)
                        .status(HttpStatus.OK)
                        .data(List.of())
                        .message("Lấy danh sách banner thành công")
                        .build();
            }
        }

        List<BannerResponse> banners = bannerService.getActiveBanners(bannerPosition);
        return ResponseObject.<List<BannerResponse>>builder()
                .isSuccess(true)
                .status(HttpStatus.OK)
                .data(banners)
                .message("Lấy danh sách banner thành công")
                .build();
    }

    /**
     * Get active banners grouped by position
     * Returns all active banners grouped by their position
     */
    @GetMapping("/grouped")
    public ResponseObject<List<BannerResponse>> getGroupedBanners() {
        List<BannerResponse> banners = bannerService.getAllActiveBanners();
        return ResponseObject.<List<BannerResponse>>builder()
                .isSuccess(true)
                .status(HttpStatus.OK)
                .data(banners)
                .message("Lấy danh sách banner thành công")
                .build();
    }
}
