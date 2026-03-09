package com.example.datn.controller.admin.common;

import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.constant.MappingConstants;
import com.example.datn.utils.CloudinaryUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping(MappingConstants.API + "/upload")
@RequiredArgsConstructor
public class UploadController {

    private final CloudinaryUtils cloudinaryUtils;

    @PostMapping
    public ResponseObject<Map<String, String>> upload(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseObject.<Map<String, String>>builder()
                    .isSuccess(false)
                    .status(HttpStatus.BAD_REQUEST)
                    .message("File không được để trống")
                    .build();
        }

        try {
            String imageUrl = cloudinaryUtils.uploadImage(file, "banners");
            Map<String, String> result = new HashMap<>();
            result.put("url", imageUrl);
            result.put("publicId", "banners");

            return ResponseObject.<Map<String, String>>builder()
                    .isSuccess(true)
                    .status(HttpStatus.OK)
                    .data(result)
                    .message("Upload ảnh thành công")
                    .build();
        } catch (Exception e) {
            return ResponseObject.<Map<String, String>>builder()
                    .isSuccess(false)
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .message("Lỗi khi upload ảnh: " + e.getMessage())
                    .build();
        }
    }
}
