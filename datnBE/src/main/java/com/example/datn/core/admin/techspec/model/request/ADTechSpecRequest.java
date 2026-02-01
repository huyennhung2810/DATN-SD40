package com.example.datn.core.admin.techspec.model.request;

import com.example.datn.infrastructure.constant.EntityStatus;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ADTechSpecRequest {
    
    @Size(max = 100, message = "Loại cảm biến không được quá 100 ký tự")
    private String sensorType;
    
    @Size(max = 100, message = "Ngàm lens không được quá 100 ký tự")
    private String lensMount;
    
    @Size(max = 100, message = "Độ phân giải không được quá 100 ký tự")
    private String resolution;
    
    @Size(max = 100, message = "ISO không được quá 100 ký tự")
    private String iso;
    
    @Size(max = 100, message = "Bộ xử lý không được quá 100 ký tự")
    private String processor;
    
    @Size(max = 100, message = "Định dạng ảnh không được quá 100 ký tự")
    private String imageFormat;
    
    @Size(max = 100, message = "Định dạng video không được quá 100 ký tự")
    private String videoFormat;
    
    private EntityStatus status;
}