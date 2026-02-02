package com.example.datn.infrastructure.job.common.model.request;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class EXUploadRequest {

    //Dùng khi admin upload file từ máy tính
    private String id;

    private String name;

    private MultipartFile file;
}
