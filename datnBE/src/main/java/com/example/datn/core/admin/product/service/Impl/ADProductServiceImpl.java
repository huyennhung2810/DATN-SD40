package com.example.datn.core.admin.product.service.Impl;

import com.example.datn.core.admin.product.model.request.ADProductRequest;
import com.example.datn.core.admin.product.model.request.ADProductSearchRequest;
import com.example.datn.core.admin.product.model.response.ADProductResponse;
import com.example.datn.core.admin.product.repository.ADProductRepository;
import com.example.datn.core.admin.product.service.ADProductService;
import com.example.datn.core.admin.techspec.model.response.ADTechSpecResponse;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.entity.Product;
import com.example.datn.entity.ProductCategory;
import com.example.datn.entity.ProductImage;
import com.example.datn.entity.TechSpec;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.repository.ProductCategoryRepository;
import com.example.datn.core.admin.productimage.repository.ADProductImageRepository;
import com.example.datn.repository.TechSpecRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ADProductServiceImpl implements ADProductService {

    private final ADProductRepository productRepository;
    private final ProductCategoryRepository categoryRepository;
    private final TechSpecRepository techSpecRepository;
    private final ADProductImageRepository productImageRepository;

    @Override
    public PageableObject<ADProductResponse> search(ADProductSearchRequest request) {
        int page = request.getPage() > 0 ? request.getPage() - 1 : 0;
        Pageable pageable = PageRequest.of(page, request.getSize());
        
        //
        List<Object[]> results = productRepository.searchBasic(
                request.getName(),
                request.getIdProductCategory(),
                request.getIdTechSpec(),
                request.getStatus(),
                pageable
        );
        
        // Chuyển đổi Object[] sang ADProductResponse
        List<ADProductResponse> responses = results.stream()
                .map(row -> {
                    ADProductResponse response = new ADProductResponse();
                    response.setId((String) row[0]);
                    response.setName((String) row[1]);
                    response.setDescription((String) row[2]);
                    response.setIdProductCategory((String) row[3]);
                    response.setProductCategoryName((String) row[4]);
                    response.setIdTechSpec((String) row[5]);
                    response.setTechSpecName((String) row[6]);
                    response.setStatus((EntityStatus) row[7]);
                    response.setCreatedDate((Long) row[8]);
                    response.setLastModifiedDate((Long) row[9]);
                    
                    // Lấy thông số kỹ thuật
                    String techSpecId = (String) row[5];
                    if (techSpecId != null && !techSpecId.isEmpty()) {
                        TechSpec techSpec = techSpecRepository.findById(techSpecId).orElse(null);
                        if (techSpec != null) {
                            ADTechSpecResponse techSpecResponse = new ADTechSpecResponse();
                            techSpecResponse.setId(techSpec.getId());
                            techSpecResponse.setSensorType(techSpec.getSensorType());
                            techSpecResponse.setLensMount(techSpec.getLensMount());
                            techSpecResponse.setResolution(techSpec.getResolution());
                            techSpecResponse.setIso(techSpec.getIso());
                            techSpecResponse.setProcessor(techSpec.getProcessor());
                            techSpecResponse.setImageFormat(techSpec.getImageFormat());
                            techSpecResponse.setVideoFormat(techSpec.getVideoFormat());
                            techSpecResponse.setStatus(techSpec.getStatus());
                            techSpecResponse.setCreatedAt(techSpec.getCreatedDate());
                            techSpecResponse.setUpdatedAt(techSpec.getLastModifiedDate());
                            response.setTechSpec(techSpecResponse);
                        }
                    }
                    
                    // Lấy ảnh
                    String productId = (String) row[0];
                    List<ProductImage> images = productImageRepository.findImagesByProductId(productId);
                    List<String> imageUrls = images.stream()
                            .map(ProductImage::getUrl)
                            .collect(Collectors.toList());
                    response.setImageUrls(imageUrls);
                    
                    return response;
                })
                .collect(Collectors.toList());
        
        // Đếm ảnh
        long totalElements = productRepository.count();
        
        return new PageableObject<>(new PageImpl<>(responses, pageable, totalElements));
    }

    @Override
    @Transactional
    public ADProductResponse create(ADProductRequest request) {
        ProductCategory category = null;
        if (request.getIdProductCategory() != null && !request.getIdProductCategory().isEmpty()) {
            category = categoryRepository.findById(request.getIdProductCategory())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + request.getIdProductCategory()));
        }

        TechSpec techSpec = null;
        if (request.getIdTechSpec() != null && !request.getIdTechSpec().isEmpty()) {
            techSpec = techSpecRepository.findById(request.getIdTechSpec())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thông số kỹ thuật với ID: " + request.getIdTechSpec()));
        }

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setProductCategory(category);
        product.setTechSpec(techSpec);
        product.setStatus(request.getStatus());

        // Xử lý ảnh
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            List<ProductImage> images = new ArrayList<>();
            int order = 1;
            for (String url : request.getImageUrls()) {
                ProductImage image = new ProductImage();
                image.setUrl(url);
                image.setDisplayOrder(order++);
                image.setProduct(product);
                images.add(image);
            }
            product.setImages(images);
        }

        product = productRepository.save(product);

        return findById(product.getId());
    }

    @Override
    @Transactional
    public ADProductResponse update(String id, ADProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        // Xử lý category dc null
        ProductCategory category = null;
        if (request.getIdProductCategory() != null && !request.getIdProductCategory().isEmpty()) {
            category = categoryRepository.findById(request.getIdProductCategory())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + request.getIdProductCategory()));
        }

        // Xử lý techSpec
        TechSpec techSpec = null;
        if (request.getIdTechSpec() != null && !request.getIdTechSpec().isEmpty()) {
            techSpec = techSpecRepository.findById(request.getIdTechSpec())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thông số kỹ thuật với ID: " + request.getIdTechSpec()));
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setProductCategory(category);
        product.setTechSpec(techSpec);
        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }

        // Xử lý ảnh sản phẩm - hên sui vcl
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            // Xóa ảnh cũ
            product.getImages().clear();
            
            // Thêm ảnh mới
            int order = 1;
            for (String url : request.getImageUrls()) {
                ProductImage image = new ProductImage();
                image.setUrl(url);
                image.setDisplayOrder(order++);
                image.setProduct(product);
                product.getImages().add(image);
            }
        } else if (request.getImageUrls() != null) {
            // Nếu imageUrls là empty list, xóa tất cả ảnh cũ
            product.getImages().clear();
        }

        productRepository.save(product);

        return findById(id);
    }

    @Override
    @Transactional
    public void delete(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
        productRepository.delete(product);
    }

    @Override
    public ADProductResponse findById(String id) {
        return productRepository.findById(id)
                .map(product -> {
                    ADProductResponse response = new ADProductResponse();
                    response.setId(product.getId());
                    response.setName(product.getName());
                    response.setDescription(product.getDescription());
                    response.setStatus(product.getStatus());
                    response.setCreatedDate(product.getCreatedDate());
                    response.setLastModifiedDate(product.getLastModifiedDate());

                    if (product.getProductCategory() != null) {
                        response.setIdProductCategory(product.getProductCategory().getId());
                        response.setProductCategoryName(product.getProductCategory().getName());
                    }

                    if (product.getTechSpec() != null) {
                        response.setIdTechSpec(product.getTechSpec().getId());
                        response.setTechSpecName(product.getTechSpec().getSensorType());
                        // Trả về thông số kỹ thuật đầy đủ
                        ADTechSpecResponse techSpecResponse = new ADTechSpecResponse();
                        techSpecResponse.setId(product.getTechSpec().getId());
                        techSpecResponse.setSensorType(product.getTechSpec().getSensorType());
                        techSpecResponse.setLensMount(product.getTechSpec().getLensMount());
                        techSpecResponse.setResolution(product.getTechSpec().getResolution());
                        techSpecResponse.setIso(product.getTechSpec().getIso());
                        techSpecResponse.setProcessor(product.getTechSpec().getProcessor());
                        techSpecResponse.setImageFormat(product.getTechSpec().getImageFormat());
                        techSpecResponse.setVideoFormat(product.getTechSpec().getVideoFormat());
                        techSpecResponse.setStatus(product.getTechSpec().getStatus());
                        techSpecResponse.setCreatedAt(product.getTechSpec().getCreatedDate());
                        techSpecResponse.setUpdatedAt(product.getTechSpec().getLastModifiedDate());
                        response.setTechSpec(techSpecResponse);
                    }

                    // Lấy danh sách URL ảnh
                    if (product.getImages() != null && !product.getImages().isEmpty()) {
                        List<String> imageUrls = product.getImages().stream()
                                .sorted((a, b) -> Integer.compare(
                                        a.getDisplayOrder() != null ? a.getDisplayOrder() : 0,
                                        b.getDisplayOrder() != null ? b.getDisplayOrder() : 0))
                                .map(ProductImage::getUrl)
                                .collect(Collectors.toList());
                        response.setImageUrls(imageUrls);
                    }

                    return response;
                })
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
    }
}