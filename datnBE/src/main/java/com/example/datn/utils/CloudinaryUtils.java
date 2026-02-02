package com.example.datn.utils;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class CloudinaryUtils {

    private final Cloudinary cloudinary;

    // e có sửa qua tý :_)) -> lỗi bảo e ạ
    public String uploadImage(byte[] data, String folder) {
        try {
            Map uploadResult = cloudinary.uploader().upload(
                    data,
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "image"
                    )
            );

            return uploadResult.get("secure_url").toString();
        } catch (Exception e) {
            log.error("Upload image error", e);
            throw new RuntimeException("Không thể upload ảnh");
        }
    }

    // Thêm MultipartFile
    public String uploadImage(MultipartFile file, String folder) {
        try {
            byte[] data = file.getBytes();
            return uploadImage(data, folder);
        } catch (Exception e) {
            log.error("Upload image from MultipartFile error", e);
            throw new RuntimeException("Không thể upload ảnh từ file");
        }
    }

    // Thêm phương thức mặc định (không cần folder)
    public String uploadImage(MultipartFile file) {
        return uploadImage(file, "default");
    }

    public void deleteImage(String imageUrl) {
        try {
            String publicId = extractPublicId(imageUrl);
            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            }
        } catch (Exception e) {
            log.error("Delete image error", e);
        }
    }

    public static String extractPublicId(String imageUrl) {
        if (imageUrl == null || !imageUrl.contains("cloudinary.com")) {
            return null;
        }

        try {
            String splitKeyword = "/upload/";
            int startIndex = imageUrl.indexOf(splitKeyword) + splitKeyword.length();

            String remainingPath = imageUrl.substring(startIndex);

            remainingPath = remainingPath.replaceFirst("^v\\d+/", "");

            int dotIndex = remainingPath.lastIndexOf(".");
            if (dotIndex != -1) {
                return remainingPath.substring(0, dotIndex);
            }

            return remainingPath;
        } catch (Exception e) {
            log.error("Lỗi extract publicId", e);
            return null;
        }
    }
}