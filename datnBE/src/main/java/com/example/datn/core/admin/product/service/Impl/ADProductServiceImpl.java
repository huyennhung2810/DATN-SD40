package com.example.datn.core.admin.product.service.Impl;

import com.example.datn.core.admin.color.repository.ADColorRepository;
import com.example.datn.core.admin.product.model.request.ADProductRequest;
import com.example.datn.core.admin.product.model.request.ADProductSearchRequest;
import com.example.datn.core.admin.product.model.response.ADProductImageSimpleResponse;
import com.example.datn.core.admin.product.model.response.ADProductResponse;
import com.example.datn.core.admin.product.model.response.ADProductVariantResponse;
import com.example.datn.core.admin.product.model.response.ADProductWithVariantsResponse;
import com.example.datn.core.admin.product.repository.ADProductRepository;
import com.example.datn.core.admin.product.service.ADProductService;
import com.example.datn.core.admin.productdetail.model.request.ADProductDetailRequest;
import com.example.datn.core.admin.productdetail.repository.ADProductDetailRepository;
import com.example.datn.core.admin.productimage.repository.ADProductImageRepository;
import com.example.datn.core.admin.serial.model.response.ADSerialResponse;
import com.example.datn.core.admin.serial.repository.ADSerialRepository;
import com.example.datn.core.admin.storagecapacity.repository.ADStorageCapacityRepository;
import com.example.datn.core.admin.techspec.model.response.ADTechSpecResponse;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.entity.*;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.ProductVersion;
import com.example.datn.infrastructure.constant.SerialStatus;
import com.example.datn.repository.ProductCategoryRepository;
import com.example.datn.repository.TechSpecRepository;
import com.example.datn.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ADProductServiceImpl implements ADProductService {

    private final ADProductRepository productRepository;
    private final ProductCategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final TechSpecRepository techSpecRepository;
    private final ADProductImageRepository productImageRepository;
    private final ADProductDetailRepository productDetailRepository;
    private final ADColorRepository colorRepository;
    private final ADStorageCapacityRepository storageCapacityRepository;
    private final ADSerialRepository serialRepository;

    @Override
    public PageableObject<ADProductResponse> search(ADProductSearchRequest request) {
        int page = request.getPage() > 0 ? request.getPage() - 1 : 0;
        Pageable pageable = PageRequest.of(page, request.getSize());
        
        //
        List<Object[]> results = productRepository.searchBasic(
                request.getName(),
                request.getIdProductCategory(),
                request.getIdBrand(),
                request.getIdTechSpec(),
                request.getStatus(),
                request.getSensorType(),
                request.getLensMount(),
                request.getResolution(),
                request.getProcessor(),
                request.getImageFormat(),
                request.getVideoFormat(),
                request.getIso(),
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
                    response.setIdBrand((String) row[5]);
                    response.setBrandName((String) row[6]);
                    response.setIdTechSpec((String) row[7]);
                    response.setTechSpecName((String) row[8]);
                    response.setPrice(row[9] != null ? (java.math.BigDecimal) row[9] : null);
                    response.setStatus((EntityStatus) row[10]);
                    response.setCreatedDate((Long) row[11]);
                    response.setLastModifiedDate((Long) row[12]);
                    
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

        Brand brand = null;
        if (request.getIdBrand() != null && !request.getIdBrand().isEmpty()) {
            brand = brandRepository.findById(request.getIdBrand())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu với ID: " + request.getIdBrand()));
        }

        TechSpec techSpec = null;
        if (request.getIdTechSpec() != null && !request.getIdTechSpec().isEmpty()) {
            techSpec = techSpecRepository.findById(request.getIdTechSpec())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thông số kỹ thuật với ID: " + request.getIdTechSpec()));
        }

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setProductCategory(category);
        product.setBrand(brand);
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

        // Xử lý brand
        Brand brand = null;
        if (request.getIdBrand() != null && !request.getIdBrand().isEmpty()) {
            brand = brandRepository.findById(request.getIdBrand())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu với ID: " + request.getIdBrand()));
        }

        // Xử lý techSpec
        TechSpec techSpec = null;
        if (request.getIdTechSpec() != null && !request.getIdTechSpec().isEmpty()) {
            techSpec = techSpecRepository.findById(request.getIdTechSpec())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thông số kỹ thuật với ID: " + request.getIdTechSpec()));
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setProductCategory(category);
        product.setBrand(brand);
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
                    response.setPrice(product.getPrice());
                    response.setStatus(product.getStatus());
                    response.setCreatedDate(product.getCreatedDate());
                    response.setLastModifiedDate(product.getLastModifiedDate());

                    if (product.getProductCategory() != null) {
                        response.setIdProductCategory(product.getProductCategory().getId());
                        response.setProductCategoryName(product.getProductCategory().getName());
                    }

                    if (product.getBrand() != null) {
                        response.setIdBrand(product.getBrand().getId());
                        response.setBrandName(product.getBrand().getName());
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

    @Override
    public ADProductWithVariantsResponse getProductWithVariants(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        // Lấy danh sách biến thể của sản phẩm (kèm theo serials)
        List<ProductDetail> variants = productDetailRepository.findByProductIdWithSerials(id);

        // Build response cho sản phẩm cha
        ADProductWithVariantsResponse response = ADProductWithVariantsResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .status(product.getStatus())
                .createdDate(product.getCreatedDate())
                .lastModifiedDate(product.getLastModifiedDate())
                .build();

        if (product.getProductCategory() != null) {
            response.setIdProductCategory(product.getProductCategory().getId());
            response.setProductCategoryName(product.getProductCategory().getName());
        }

        if (product.getTechSpec() != null) {
            response.setIdTechSpec(product.getTechSpec().getId());
            response.setTechSpecName(product.getTechSpec().getSensorType());

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

        // Lấy danh sách URL ảnh sản phẩm cha
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            List<String> imageUrls = product.getImages().stream()
                    .sorted((a, b) -> Integer.compare(
                            a.getDisplayOrder() != null ? a.getDisplayOrder() : 0,
                            b.getDisplayOrder() != null ? b.getDisplayOrder() : 0))
                    .map(ProductImage::getUrl)
                    .collect(Collectors.toList());
            response.setImageUrls(imageUrls);

            // Lấy danh sách ảnh chi tiết (bao gồm id, url, displayOrder) để chọn cho biến thể
            List<ADProductImageSimpleResponse> productImages = product.getImages().stream()
                    .sorted((a, b) -> Integer.compare(
                            a.getDisplayOrder() != null ? a.getDisplayOrder() : 0,
                            b.getDisplayOrder() != null ? b.getDisplayOrder() : 0))
                    .map(img -> ADProductImageSimpleResponse.builder()
                            .id(img.getId())
                            .url(img.getUrl())
                            .displayOrder(img.getDisplayOrder())
                            .build())
                    .collect(Collectors.toList());
            response.setProductImages(productImages);
        }

        // Map danh sách biến thể
        List<ADProductVariantResponse> variantResponses = variants.stream()
                .map(this::mapToVariantResponse)
                .collect(Collectors.toList());

        response.setVariants(variantResponses);

        // Tính toán thông tin tổng hợp từ các biến thể
        if (variants != null && !variants.isEmpty()) {
            int totalQuantity = variants.stream()
                    .filter(v -> v.getQuantity() != null)
                    .mapToInt(ProductDetail::getQuantity)
                    .sum();

            BigDecimal minPrice = variants.stream()
                    .filter(v -> v.getSalePrice() != null)
                    .map(ProductDetail::getSalePrice)
                    .min(BigDecimal::compareTo)
                    .orElse(null);

            BigDecimal maxPrice = variants.stream()
                    .filter(v -> v.getSalePrice() != null)
                    .map(ProductDetail::getSalePrice)
                    .max(BigDecimal::compareTo)
                    .orElse(null);

            response.setTotalQuantity(totalQuantity);
            response.setMinPrice(minPrice);
            response.setMaxPrice(maxPrice);
            response.setVariantCount(variants.size());
        } else {
            response.setTotalQuantity(0);
            response.setVariantCount(0);
        }

        return response;
    }

    private ADProductVariantResponse mapToVariantResponse(ProductDetail variant) {
        ADProductVariantResponse response = new ADProductVariantResponse();
        response.setId(variant.getId());
        response.setCode(variant.getCode());
        response.setVersion(variant.getVersion());

        // LEVEL 1: Map variantVersion - với fallback cho dữ liệu cũ
        String variantVersion = variant.getVariantVersion();
        if (variantVersion == null || variantVersion.isBlank()) {
            variantVersion = ProductVersion.BODY_ONLY.name(); // Default fallback
        }
        response.setVariantVersion(variantVersion);
        response.setVariantVersionDisplayName(ProductVersion.fromString(variantVersion).getDisplayName());

        response.setSalePrice(variant.getSalePrice());
        response.setQuantity(variant.getQuantity());
        response.setStatus(variant.getStatus());
        response.setImageUrl(variant.getImageUrl());

        // Set selected image info
        response.setSelectedImageId(variant.getSelectedImageId());

        // Nếu có selectedImageId, lấy URL từ ProductImage của sản phẩm mẹ
        if (variant.getSelectedImageId() != null && !variant.getSelectedImageId().isEmpty() && variant.getProduct() != null) {
            List<ProductImage> productImages = productImageRepository.findImagesByProductId(variant.getProduct().getId());
            productImages.stream()
                    .filter(img -> img.getId().equals(variant.getSelectedImageId()))
                    .findFirst()
                    .ifPresent(img -> response.setSelectedImageUrl(img.getUrl()));
        }

        // Fallback: nếu không có selectedImageId nhưng có imageUrl cũ, dùng imageUrl
        if (response.getSelectedImageUrl() == null && variant.getImageUrl() != null) {
            response.setSelectedImageUrl(variant.getImageUrl());
        }

        if (variant.getColor() != null) {
            response.setColorId(variant.getColor().getId());
            response.setColorName(variant.getColor().getName());
            response.setColorCode(variant.getColor().getCode());
        }

        if (variant.getStorageCapacity() != null) {
            response.setStorageCapacityId(variant.getStorageCapacity().getId());
            response.setStorageCapacityName(variant.getStorageCapacity().getName());
        }

        // Map danh sách serial của biến thể
        if (variant.getSerials() != null && !variant.getSerials().isEmpty()) {
            List<ADSerialResponse> serialResponses = variant.getSerials().stream()
                    .map(this::mapToSerialResponse)
                    .collect(Collectors.toList());
            response.setSerials(serialResponses);
        }

        return response;
    }

    // Map Serial entity to ADSerialResponse
    private ADSerialResponse mapToSerialResponse(Serial serial) {
        return ADSerialResponse.builder()
                .id(serial.getId())
                .serialNumber(serial.getSerialNumber())
                .code(serial.getCode())
                .status(serial.getStatus())
                .serialStatus(serial.getSerialStatus())
                .productDetailId(serial.getProductDetail() != null ? serial.getProductDetail().getId() : null)
                .createdDate(serial.getCreatedDate() != null ? serial.getCreatedDate().toString() : null)
                .build();
    }

    @Override
    @Transactional
    public ADProductVariantResponse addVariant(String productId, ADProductDetailRequest request) {
        // Kiểm tra sản phẩm tồn tại
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        // Validate không cho tạo biến thể trùng
        boolean exists = productDetailRepository.existsByProductIdAndColorIdAndStorageCapacityId(
                productId,
                request.getColorId(),
                request.getStorageCapacityId()
        );

        if (exists) {
            throw new RuntimeException("Biến thể với màu sắc và dung lượng này đã tồn tại trong sản phẩm!");
        }

        // Validate selectedImageId nếu có - phải thuộc về sản phẩm mẹ
        if (request.getSelectedImageId() != null && !request.getSelectedImageId().isEmpty()) {
            List<ProductImage> productImages = productImageRepository.findImagesByProductId(productId);
            boolean imageBelongsToProduct = productImages.stream()
                    .anyMatch(img -> img.getId().equals(request.getSelectedImageId()));
            if (!imageBelongsToProduct) {
                throw new RuntimeException("Ảnh đại diện không thuộc sản phẩm này!");
            }
        }

        ProductDetail variant = new ProductDetail();
        variant.setCode(request.getCode());

        // LEVEL 1: Auto-generate version name từ variantVersion + color + storage
        String colorName = "";
        String storageName = "";
        if (request.getColorId() != null && !request.getColorId().isEmpty()) {
            colorName = colorRepository.findById(request.getColorId())
                    .map(c -> c.getName())
                    .orElse("");
        }
        if (request.getStorageCapacityId() != null && !request.getStorageCapacityId().isEmpty()) {
            storageName = storageCapacityRepository.findById(request.getStorageCapacityId())
                    .map(s -> s.getName())
                    .orElse("");
        }

        // Lưu variantVersion - enum value (BODY_ONLY, KIT_18_45, KIT_18_150)
        String variantVersion = request.getVariantVersion();
        if (variantVersion == null || variantVersion.isBlank()) {
            variantVersion = ProductVersion.BODY_ONLY.name(); // Default
        }
        variant.setVariantVersion(variantVersion);

        // Auto-generate version name: {VariantVersion} / {Color} / {Storage}
        String generatedVersion = ProductVersion.formatFullName(variantVersion, colorName, storageName);
        variant.setVersion(generatedVersion);

        variant.setSalePrice(request.getSalePrice());
        variant.setStatus(request.getStatus() != null ? request.getStatus() : EntityStatus.ACTIVE);
        variant.setNote(request.getNote());
        variant.setImageUrl(request.getImageUrl());

        // Lưu selectedImageId - ID của ảnh được chọn từ sản phẩm mẹ
        variant.setSelectedImageId(request.getSelectedImageId());

        // Gán sản phẩm cha
        variant.setProduct(product);

        // Gán color và storage capacity
        if (request.getColorId() != null && !request.getColorId().isEmpty()) {
            variant.setColor(colorRepository.findById(request.getColorId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy màu sắc")));
        }

        if (request.getStorageCapacityId() != null && !request.getStorageCapacityId().isEmpty()) {
            variant.setStorageCapacity(storageCapacityRepository.findById(request.getStorageCapacityId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy dung lượng")));
        }

        // Số lượng tồn kho (có thể null)
        variant.setQuantity(request.getQuantity() != null ? request.getQuantity() : 0);

        // Xử lý serial nếu có
        if (request.getSerials() != null && !request.getSerials().isEmpty()) {
            List<String> serialNumbers = request.getSerials().stream()
                    .map(s -> s.getSerialNumber())
                    .filter(s -> s != null && !s.trim().isEmpty())
                    .distinct()
                    .collect(Collectors.toList());

            // Kiểm tra serial đã tồn tại trong hệ thống chưa
            if (!serialNumbers.isEmpty()) {
                List<String> existingInSystem = serialRepository.findExistingSerialNumbers(serialNumbers);
                if (!existingInSystem.isEmpty()) {
                    throw new RuntimeException("Các serial sau đã tồn tại trong hệ thống: " + String.join(", ", existingInSystem));
                }

                // Lưu các serial mới
                for (String serialNumber : serialNumbers) {
                    Serial newSerial = new Serial();
                    newSerial.setSerialNumber(serialNumber);
                    newSerial.setCode(serialNumber);
                    newSerial.setSerialStatus(SerialStatus.AVAILABLE);
                    newSerial.setStatus(EntityStatus.ACTIVE);
                    newSerial.setProductDetail(variant);
                    serialRepository.save(newSerial);
                }

                // Cập nhật số lượng theo số serial
                variant.setQuantity(serialNumbers.size());
            }
        }

        variant = productDetailRepository.save(variant);

        // Re-fetch để lấy serial đã lưu
        variant = productDetailRepository.findByIdWithSerials(variant.getId())
                .orElse(variant);

        return mapToVariantResponse(variant);
    }

    @Override
    @Transactional
    public ADProductVariantResponse updateVariant(String variantId, ADProductDetailRequest request) {
        ProductDetail variant = productDetailRepository.findByIdWithSerials(variantId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biến thể sản phẩm"));

        // Validate không cho tạo biến thể trùng (ngoại trừ chính nó)
        if (request.getColorId() != null && request.getStorageCapacityId() != null) {
            boolean exists = productDetailRepository.existsByProductIdAndColorIdAndStorageCapacityIdAndIdNot(
                    variant.getProduct().getId(),
                    request.getColorId(),
                    request.getStorageCapacityId(),
                    variantId
            );

            if (exists) {
                throw new RuntimeException("Biến thể với màu sắc và dung lượng này đã tồn tại trong sản phẩm!");
            }
        }

        // Validate selectedImageId nếu có - phải thuộc về sản phẩm mẹ
        if (request.getSelectedImageId() != null && !request.getSelectedImageId().isEmpty()) {
            List<ProductImage> productImages = productImageRepository.findImagesByProductId(variant.getProduct().getId());
            boolean imageBelongsToProduct = productImages.stream()
                    .anyMatch(img -> img.getId().equals(request.getSelectedImageId()));
            if (!imageBelongsToProduct) {
                throw new RuntimeException("Ảnh đại diện không thuộc sản phẩm này!");
            }
        }

        // Cập nhật thông tin
        if (request.getCode() != null) {
            variant.setCode(request.getCode());
        }

        // LEVEL 1: Auto-generate version name khi có variantVersion mới hoặc color/storage thay đổi
        String colorName = variant.getColor() != null ? variant.getColor().getName() : "";
        String storageName = variant.getStorageCapacity() != null ? variant.getStorageCapacity().getName() : "";

        // Nếu color hoặc storage thay đổi, cập nhật lại tên
        if (request.getColorId() != null && !request.getColorId().isEmpty()) {
            colorName = colorRepository.findById(request.getColorId())
                    .map(c -> c.getName())
                    .orElse(colorName);
        }
        if (request.getStorageCapacityId() != null && !request.getStorageCapacityId().isEmpty()) {
            storageName = storageCapacityRepository.findById(request.getStorageCapacityId())
                    .map(s -> s.getName())
                    .orElse(storageName);
        }

        // Cập nhật variantVersion và regenerate version name
        String variantVersion = request.getVariantVersion();
        if (variantVersion != null && !variantVersion.isBlank()) {
            variant.setVariantVersion(variantVersion);
        } else if (variant.getVariantVersion() == null || variant.getVariantVersion().isBlank()) {
            variant.setVariantVersion(ProductVersion.BODY_ONLY.name()); // Default fallback
        }

        // Auto-generate version name: {VariantVersion} / {Color} / {Storage}
        String currentVariantVersion = variant.getVariantVersion();
        String generatedVersion = ProductVersion.formatFullName(currentVariantVersion, colorName, storageName);
        variant.setVersion(generatedVersion);

        if (request.getSalePrice() != null) {
            variant.setSalePrice(request.getSalePrice());
        }
        if (request.getStatus() != null) {
            variant.setStatus(request.getStatus());
        }
        if (request.getNote() != null) {
            variant.setNote(request.getNote());
        }
        if (request.getImageUrl() != null) {
            variant.setImageUrl(request.getImageUrl());
        }
        if (request.getQuantity() != null) {
            variant.setQuantity(request.getQuantity());
        }

        // Cập nhật selectedImageId - ID của ảnh được chọn từ sản phẩm mẹ
        if (request.getSelectedImageId() != null) {
            variant.setSelectedImageId(request.getSelectedImageId());
        }

        // Cập nhật color và storage capacity
        if (request.getColorId() != null && !request.getColorId().isEmpty()) {
            variant.setColor(colorRepository.findById(request.getColorId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy màu sắc")));
        }

        if (request.getStorageCapacityId() != null && !request.getStorageCapacityId().isEmpty()) {
            variant.setStorageCapacity(storageCapacityRepository.findById(request.getStorageCapacityId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy dung lượng")));
        }

        // Xử lý thêm serial mới (chỉ append, không ghi đè serial cũ)
        if (request.getNewSerials() != null && !request.getNewSerials().isEmpty()) {
            // Loại bỏ các giá trị null/empty sau khi trim
            List<String> newSerialList = request.getNewSerials().stream()
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .distinct()
                    .collect(Collectors.toList());

            // Lấy danh sách serial hiện tại của biến thể
            List<String> existingSerials = serialRepository.findByProductDetailId(variantId)
                    .stream()
                    .map(Serial::getSerialNumber)
                    .collect(Collectors.toList());

            // Kiểm tra trùng lặp trong danh sách mới
            Set<String> uniqueNewSerials = new HashSet<>(newSerialList);
            if (uniqueNewSerials.size() != newSerialList.size()) {
                throw new RuntimeException("Danh sách serial mới có chứa mã trùng lặp!");
            }

            // Kiểm tra trùng với serial hiện có của biến thể
            List<String> duplicateWithExisting = newSerialList.stream()
                    .filter(existingSerials::contains)
                    .collect(Collectors.toList());

            if (!duplicateWithExisting.isEmpty()) {
                throw new RuntimeException("Các serial sau đã tồn tại trong biến thể: " + String.join(", ", duplicateWithExisting));
            }

            // Kiểm tra serial đã tồn tại trong toàn hệ thống (nếu có yêu cầu)
            List<String> existingInSystem = serialRepository.findExistingSerialNumbers(newSerialList);
            if (!existingInSystem.isEmpty()) {
                throw new RuntimeException("Các serial sau đã tồn tại trong hệ thống: " + String.join(", ", existingInSystem));
            }

            // Thêm các serial mới vào biến thể
            int addedCount = 0;
            for (String serialNumber : newSerialList) {
                Serial newSerial = new Serial();
                newSerial.setSerialNumber(serialNumber);
                newSerial.setCode(serialNumber);
                newSerial.setSerialStatus(SerialStatus.AVAILABLE);
                newSerial.setStatus(EntityStatus.ACTIVE);
                newSerial.setProductDetail(variant);
                serialRepository.save(newSerial);
                addedCount++;
            }

            // Cập nhật lại quantity của biến thể
            int currentQuantity = variant.getQuantity() != null ? variant.getQuantity() : 0;
            variant.setQuantity(currentQuantity + addedCount);
        }

        variant = productDetailRepository.save(variant);

        return mapToVariantResponse(variant);
    }

    @Override
    @Transactional
    public ADProductVariantResponse updateVariantImage(String variantId, String selectedImageId) {
        ProductDetail variant = productDetailRepository.findByIdWithSerials(variantId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biến thể sản phẩm"));

        // Validate selectedImageId nếu có - phải thuộc về sản phẩm mẹ
        if (selectedImageId != null && !selectedImageId.isEmpty()) {
            List<ProductImage> productImages = productImageRepository.findImagesByProductId(variant.getProduct().getId());
            boolean imageBelongsToProduct = productImages.stream()
                    .anyMatch(img -> img.getId().equals(selectedImageId));
            if (!imageBelongsToProduct) {
                throw new RuntimeException("Ảnh đại diện không thuộc sản phẩm này!");
            }
        }

        // Cập nhật selectedImageId
        variant.setSelectedImageId(selectedImageId);
        variant = productDetailRepository.save(variant);

        return mapToVariantResponse(variant);
    }

    @Override
    @Transactional
    public void deleteVariant(String variantId) {
        ProductDetail variant = productDetailRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biến thể sản phẩm"));

        productDetailRepository.delete(variant);
    }
}