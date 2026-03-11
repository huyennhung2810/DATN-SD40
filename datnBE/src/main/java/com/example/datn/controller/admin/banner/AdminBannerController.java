package com.example.datn.controller.admin.banner;

import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.service.banner.BannerService;
import com.example.datn.service.banner.dto.BannerRequest;
import com.example.datn.service.banner.dto.BannerResponse;
import com.example.datn.service.banner.dto.BannerSearchRequest;
//import com.example.datn.utils.base.ResponseObject;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/banners")
@RequiredArgsConstructor
public class AdminBannerController {

    private final BannerService bannerService;

    @GetMapping
    public ResponseObject<Page<BannerResponse>> search(@ModelAttribute BannerSearchRequest request) {
        return ResponseObject.<Page<BannerResponse>>builder()
                .data(bannerService.search(request))
                .build();
    }

    @GetMapping("/{id}")
    public ResponseObject<BannerResponse> findById(@PathVariable String id) {
        return ResponseObject.<BannerResponse>builder()
                .data(bannerService.findById(id))
                .build();
    }

    @PostMapping
    public ResponseObject<BannerResponse> create(@Valid @RequestBody BannerRequest request) {
        return ResponseObject.<BannerResponse>builder()
                .data(bannerService.create(request))
                .build();
    }

    @PutMapping("/{id}")
    public ResponseObject<BannerResponse> update(@PathVariable String id, @Valid @RequestBody BannerRequest request) {
        return ResponseObject.<BannerResponse>builder()
                .data(bannerService.update(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ResponseObject<Void> delete(@PathVariable String id) {
        bannerService.delete(id);
        return ResponseObject.<Void>builder()
                .message("Xóa banner thành công")
                .build();
    }

    @PatchMapping("/{id}/status")
    public ResponseObject<Void> updateStatus(@PathVariable String id, @RequestParam Integer status) {
        bannerService.updateStatus(id, status);
        return ResponseObject.<Void>builder()
                .message("Cập nhật trạng thái thành công")
                .build();
    }
}
