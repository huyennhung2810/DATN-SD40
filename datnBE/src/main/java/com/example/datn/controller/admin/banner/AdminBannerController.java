package com.example.datn.controller.admin.banner;

import com.example.datn.dto.banner.BannerRequest;
import com.example.datn.dto.banner.BannerResponse;
import com.example.datn.dto.banner.BannerSearchRequest;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.exception.ServiceException;
import com.example.datn.infrastructure.exception.ValidationException;
import com.example.datn.service.banner.BannerService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.core.common.base.ResponseObject;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/banners")
@RequiredArgsConstructor
public class AdminBannerController {

    private final BannerService bannerService;

    @GetMapping
    public ResponseObject<PageableObject<BannerResponse>> search(
            @ModelAttribute BannerSearchRequest request) {
        return ResponseObject.<PageableObject<BannerResponse>>builder()
                .isSuccess(true)
                .status(HttpStatus.OK)
                .data(PageableObject.of(bannerService.search(request)))
                .message("Lấy danh sách banner thành công")
                .build();
    }

    @GetMapping("/{id}")
    public ResponseObject<BannerResponse> findById(@PathVariable String id) {
        return ResponseObject.<BannerResponse>builder()
                .isSuccess(true)
                .status(HttpStatus.OK)
                .data(bannerService.getById(id))
                .message("Lấy thông tin banner thành công")
                .build();
    }

    @PostMapping
    public ResponseObject<BannerResponse> create(
            @Valid @RequestBody BannerRequest request) {
        try {
            BannerResponse created = bannerService.create(request);
            return ResponseObject.<BannerResponse>builder()
                    .isSuccess(true)
                    .status(HttpStatus.CREATED)
                    .data(created)
                    .message("Thêm mới banner thành công")
                    .build();
        } catch (ValidationException e) {
            return ResponseObject.<BannerResponse>builder()
                    .isSuccess(false)
                    .status(HttpStatus.BAD_REQUEST)
                    .message(e.getMessage())
                    .build();
        } catch (ServiceException e) {
            return ResponseObject.<BannerResponse>builder()
                    .isSuccess(false)
                    .status(HttpStatus.NOT_FOUND)
                    .message(e.getMessage())
                    .build();
        }
    }

    @PutMapping("/{id}")
    public ResponseObject<BannerResponse> update(
            @PathVariable String id,
            @Valid @RequestBody BannerRequest request) {
        try {
            BannerResponse updated = bannerService.update(id, request);
            return ResponseObject.<BannerResponse>builder()
                    .isSuccess(true)
                    .status(HttpStatus.OK)
                    .data(updated)
                    .message("Cập nhật banner thành công")
                    .build();
        } catch (ValidationException e) {
            return ResponseObject.<BannerResponse>builder()
                    .isSuccess(false)
                    .status(HttpStatus.BAD_REQUEST)
                    .message(e.getMessage())
                    .build();
        } catch (ServiceException e) {
            return ResponseObject.<BannerResponse>builder()
                    .isSuccess(false)
                    .status(HttpStatus.NOT_FOUND)
                    .message(e.getMessage())
                    .build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseObject<Void> delete(@PathVariable String id) {
        try {
            bannerService.delete(id);
            return ResponseObject.<Void>builder()
                    .isSuccess(true)
                    .status(HttpStatus.OK)
                    .message("Xóa banner thành công")
                    .build();
        } catch (ServiceException e) {
            return ResponseObject.<Void>builder()
                    .isSuccess(false)
                    .status(HttpStatus.NOT_FOUND)
                    .message(e.getMessage())
                    .build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseObject<BannerResponse> changeStatus(
            @PathVariable String id,
            @RequestParam EntityStatus status) {
        try {
            BannerResponse updated = bannerService.changeStatus(id, status);
            return ResponseObject.<BannerResponse>builder()
                    .isSuccess(true)
                    .status(HttpStatus.OK)
                    .data(updated)
                    .message("Đổi trạng thái banner thành công")
                    .build();
        } catch (ServiceException e) {
            return ResponseObject.<BannerResponse>builder()
                    .isSuccess(false)
                    .status(HttpStatus.NOT_FOUND)
                    .message(e.getMessage())
                    .build();
        }
    }
}
