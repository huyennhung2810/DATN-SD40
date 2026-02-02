package com.example.datn.core.admin.productimage.service.Impl;

import com.example.datn.core.admin.productimage.model.request.ADProductImageRequest;
import com.example.datn.core.admin.productimage.model.response.ADProductImageResponse;
import com.example.datn.core.admin.productimage.repository.ADProductImageRepository;
import com.example.datn.core.admin.productimage.service.ADProductImageService;
import com.example.datn.entity.Product;
import com.example.datn.entity.ProductImage;
import com.example.datn.repository.ProductRepository;
import com.example.datn.utils.CloudinaryUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ADProductImageServiceImpl implements ADProductImageService {
    
    private final ADProductImageRepository imageRepository;
    private final ProductRepository productRepository;
    private final CloudinaryUtils cloudinaryUtils;

    private static final String PRODUCT_IMAGE_FOLDER = "products";
    @Override
    public List<ADProductImageResponse> findByProductId(String productId) {
        return imageRepository.findByProductId(productId);
    }

    @Override
    @Transactional
    public ADProductImageResponse upload(String productId, MultipartFile file) {
        try {
            // Validate product exists
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

            // Upload to Cloudinary
            String folderName = "products/" + productId;
            String imageUrl = cloudinaryUtils.uploadImage(file, folderName);

            // Get next display order
            List<ADProductImageResponse> existingImages = findByProductId(productId);
            int nextOrder = existingImages.size() + 1;

            // Create product image
            ProductImage image = new ProductImage();
            image.setProduct(product);
            image.setUrl(imageUrl);
            image.setDisplayOrder(nextOrder);

            image = imageRepository.save(image);

            return findById(image.getId());
        } catch (Exception e) {
            log.error("Lỗi khi upload ảnh: ", e);
            throw new RuntimeException("Lỗi khi upload ảnh: " + e.getMessage());
        }
    }
    @Override
    @Transactional
    public ADProductImageResponse create(ADProductImageRequest request) {
        // Validate product exists
        Product product = productRepository.findById(request.getIdProduct())
            .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
        
        // Create product image
        ProductImage image = new ProductImage();
        image.setProduct(product);
        image.setUrl(request.getUrl());
        image.setDisplayOrder(request.getDisplayOrder());
        
        image = imageRepository.save(image);
        
        return findById(image.getId());
    }
    
    @Override
    @Transactional
    public void delete(String id) {
        ProductImage image = imageRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy ảnh"));
        
        // Optional: Delete from Cloudinary
        // cloudinaryUtils.deleteImage(image.getUrl());
        
        imageRepository.delete(image);
    }
    
    @Override
    public ADProductImageResponse findById(String id) {
        return imageRepository.findById(id)
            .map(image -> {
                ADProductImageResponse response = new ADProductImageResponse();
                response.setId(image.getId());
                response.setUrl(image.getUrl());
                response.setDisplayOrder(image.getDisplayOrder());
                response.setCreatedDate(image.getCreatedDate());
                
                if (image.getProduct() != null) {
                    response.setIdProduct(image.getProduct().getId());
                    response.setProductName(image.getProduct().getName());
                }
                
                return response;
            })
            .orElseThrow(() -> new RuntimeException("Không tìm thấy ảnh"));
    }
}