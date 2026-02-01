package com.example.datn.core.admin.productimage.service;

import com.example.datn.core.admin.productimage.model.request.ADProductImageRequest;
import com.example.datn.core.admin.productimage.model.response.ADProductImageResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ADProductImageService {
    
    List<ADProductImageResponse> findByProductId(String productId);
    
    ADProductImageResponse upload(String productId, MultipartFile file);
    
    ADProductImageResponse create(ADProductImageRequest request);
    
    void delete(String id);
    
    ADProductImageResponse findById(String id);
}