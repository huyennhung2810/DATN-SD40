package com.example.datn.controller.client.banner;

import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.BannerPosition;
import com.example.datn.service.banner.BannerService;
import com.example.datn.service.banner.dto.BannerResponse;
//import com.example.datn.utils.base.ResponseObject;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/banners")
@RequiredArgsConstructor
public class ClientBannerController {

    private final BannerService bannerService;

    @GetMapping
    public ResponseObject<List<BannerResponse>> getAllActiveBanners() {
        return ResponseObject.<List<BannerResponse>>builder()
                .data(bannerService.getAllActiveBanners())
                .build();
    }

    @GetMapping("/position/{position}")
    public ResponseObject<List<BannerResponse>> getBannersByPosition(@PathVariable BannerPosition position) {
        return ResponseObject.<List<BannerResponse>>builder()
                .data(bannerService.getBannersByPosition(position))
                .build();
    }
}
