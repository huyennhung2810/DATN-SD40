package com.example.datn.core.admin.productdetail.service.Impl;

import com.example.datn.core.admin.color.repository.ADColorRepository;

import com.example.datn.core.admin.product.model.response.ADProductImageSimpleResponse;
import com.example.datn.core.admin.product.repository.ADProductRepository;
import com.example.datn.core.admin.productdetail.model.request.ADProductDetailRequest;
import com.example.datn.core.admin.productdetail.model.response.ADProductDetailResponse;
import com.example.datn.core.admin.productdetail.repository.ADProductDetailRepository;
import com.example.datn.core.admin.productdetail.service.ADProductDetailService;
import com.example.datn.core.admin.serial.model.request.ADSerialRequest;
import com.example.datn.core.admin.serial.model.response.ADSerialResponse;
import com.example.datn.core.admin.serial.repository.ADSerialRepository;
import com.example.datn.core.admin.storagecapacity.repository.ADStorageCapacityRepository;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.ProductDetail;
import com.example.datn.entity.ProductImage;
import com.example.datn.entity.Serial;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.ProductVersion;
import com.example.datn.repository.ProductImageRepository;
import com.example.datn.utils.Helper;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ADProductDetailServiceImpl implements ADProductDetailService {

    private final ADProductDetailRepository adProductDetailRepository;
    private final ADColorRepository adColorRepository;
    private final ADStorageCapacityRepository adStorageCapacityRepository;
    private final ADSerialRepository adSerialRepository;
    private final ADProductRepository adProductRepository;
    private final ProductImageRepository productImageRepository;

    @Override
    public ResponseObject<?> getAllProductDetails(String keyword, EntityStatus status) {
        List<ProductDetail> list = adProductDetailRepository.searchProductDetail(keyword, status);

        // Re-fetch each entity with serials to avoid lazy loading issues
        List<ADProductDetailResponse> dtoList = list.stream()
                .map(entity -> {
                    // Re-fetch with serials
                    ProductDetail pdWithSerials = adProductDetailRepository.findByIdWithSerials(entity.getId())
                            .orElse(entity);
                    return mapToResponse(pdWithSerials);
                })
                .toList();
        return ResponseObject.success(dtoList,"Hiển thị danh sách sản phẩm chi tiết thành công");
    }

    // Helper method to map ProductDetail entity to response
    private ADProductDetailResponse mapToResponse(ProductDetail entity) {
        ADProductImageSimpleResponse selectedImage = null;
        if (entity.getSelectedImageId() != null) {
            selectedImage = productImageRepository.findById(entity.getSelectedImageId())
                    .map(img -> ADProductImageSimpleResponse.builder()
                            .id(img.getId())
                            .url(img.getUrl())
                            .displayOrder(img.getDisplayOrder())
                            .build())
                    .orElse(null);
        }

        // Xử lý variantVersion - backward compatibility cho dữ liệu cũ
        String variantVersion = entity.getVariantVersion();
        if (variantVersion == null || variantVersion.isBlank()) {
            variantVersion = ProductVersion.BODY_ONLY.name(); // Default fallback
        }

        // Lấy display name cho variantVersion
        ProductVersion pv = ProductVersion.fromString(variantVersion);
        String variantVersionDisplayName = pv.getDisplayName();

        return ADProductDetailResponse.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .note(entity.getNote())
                .version(entity.getVersion())
                .variantVersion(variantVersion)
                .variantVersionDisplayName(variantVersionDisplayName)
                .quantity(entity.getQuantity())
                .salePrice(entity.getSalePrice())
                .status(entity.getStatus())
                .colorId(entity.getColor() != null ? entity.getColor().getId() : null)
                .colorName(entity.getColor() != null ? entity.getColor().getName() : "")
                .productId(entity.getProduct() != null ? entity.getProduct().getId() : null)
                .productCode(entity.getProduct() != null ? entity.getProduct().getCode() : null)
                .productName(entity.getProduct() != null ? entity.getProduct().getName() : "")
                .storageCapacityId(entity.getStorageCapacity() != null ? entity.getStorageCapacity().getId() : null)
                .storageCapacityName(entity.getStorageCapacity() != null ? entity.getStorageCapacity().getName() : "")
                .creationDate(Helper.formatDate(entity.getCreatedDate()))
                .imageUrl(entity.getImageUrl())
                .selectedImageId(entity.getSelectedImageId())
                .selectedImage(selectedImage)
                .serials(entity.getSerials() != null ? entity.getSerials().stream().map(s ->{
                    ADSerialResponse sRes = new ADSerialResponse();
                    sRes.setSerialNumber(s.getSerialNumber());

                    // Lấy Trạng thái (ép kiểu Enum sang String nếu cần)
                    sRes.setStatus(s.getStatus() != null ? s.getStatus() : null);

                    // Lấy Ngày thêm và format
                    sRes.setCreatedDate(s.getCreatedDate() != null ? Helper.formatDate(s.getCreatedDate()) : null);

                    return sRes;
                }).collect(Collectors.toList()) : new ArrayList<>()).build();
    }

    @Override
    public ResponseObject<?> getById(String id) {
        ProductDetail pd = adProductDetailRepository.findByIdWithSerials(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy SPCT"));

        // Convert sang Response DTO
        ADProductDetailResponse response = mapToResponse(pd);

        return ResponseObject.success(response, "Tìm thành công");
    }

    @Override
    public ADProductDetailResponse addProductDetail(ADProductDetailRequest request) {

        List<String> serialNumbers = new ArrayList<>();

        // 1. Kiểm tra trùng mã Serial trong Database
        if (request.getSerials() != null && !request.getSerials().isEmpty()) {
            serialNumbers = request.getSerials().stream()
                    .map(ADSerialRequest::getSerialNumber)
                    .collect(Collectors.toList());

            if (adSerialRepository.existsBySerialNumberIn(serialNumbers)) {
                // Bạn có thể ném ra Custom Exception của dự án
                throw new RuntimeException("Phát hiện mã Serial đã tồn tại trong hệ thống!");
            }
        }

        // Validate selectedImageId - phải thuộc về sản phẩm mẹ
        if (request.getSelectedImageId() != null && !request.getSelectedImageId().isEmpty()) {
            ProductImage selectedImage = productImageRepository.findById(request.getSelectedImageId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy ảnh với ID: " + request.getSelectedImageId()));

            // Kiểm tra ảnh có thuộc sản phẩm mẹ không
            String productId = request.getProductId();
            if (selectedImage.getProduct() == null || !selectedImage.getProduct().getId().equals(productId)) {
                throw new RuntimeException("Ảnh được chọn không thuộc sản phẩm mẹ này!");
            }
        }

        ProductDetail spct = new ProductDetail();
        spct.setCode(request.getCode());

        // LEVEL 1: Auto-generate version name từ variantVersion + color + storage
        // Format: {VariantVersion} / {Color} / {Storage}
        String colorName = adColorRepository.findById(request.getColorId())
                .map(c -> c.getName())
                .orElse("");
        String storageName = adStorageCapacityRepository.findById(request.getStorageCapacityId())
                .map(s -> s.getName())
                .orElse("");
        String generatedVersion = ProductVersion.formatFullName(request.getVariantVersion(), colorName, storageName);
        spct.setVersion(generatedVersion);

        // Lưu variantVersion - enum value (BODY_ONLY, KIT_18_45, KIT_18_150)
        spct.setVariantVersion(request.getVariantVersion());

        spct.setSalePrice(request.getSalePrice());
        spct.setStatus(request.getStatus());
        spct.setNote(request.getNote());

        // Chốt chặt số lượng tồn kho bằng chính số lượng Serial gửi lên
        spct.setQuantity(serialNumbers.size());

        // Móc nối các khóa ngoại (Product, Color, StorageCapacity)
        spct.setProduct(adProductRepository.findById(request.getProductId()).orElseThrow());
        spct.setColor(adColorRepository.findById(request.getColorId()).orElseThrow());
        spct.setStorageCapacity(adStorageCapacityRepository.findById(request.getStorageCapacityId()).orElseThrow());

        // Thêm ảnh cho biến thể - ảnh cũ (url trực tiếp)
        spct.setImageUrl(request.getImageUrl());

        // Lưu selectedImageId - ảnh được chọn từ sản phẩm mẹ
        spct.setSelectedImageId(request.getSelectedImageId());

        // LƯU SPCT LẦN 1: Để Database sinh ra ID cho cái SPCT này
        ProductDetail savedSpct = adProductDetailRepository.save(spct);

        // 3. Xử lý lưu mảng Serial
        if (request.getSerials() != null && !request.getSerials().isEmpty()) {
            List<Serial> serialEntities = request.getSerials().stream().map(sReq -> {
                Serial serial = new Serial();
                serial.setSerialNumber(sReq.getSerialNumber());

                // Generate code nếu không có
                if (sReq.getCode() == null || sReq.getCode().isEmpty()) {
                    serial.setCode("SERIAL" + System.currentTimeMillis() + (int)(Math.random() * 1000));
                } else {
                    serial.setCode(sReq.getCode());
                }

                serial.setCreatedDate(System.currentTimeMillis());

                // Default status to ACTIVE if not provided
                serial.setStatus(sReq.getStatus() != null ? sReq.getStatus() : EntityStatus.ACTIVE);
                serial.setProductDetail(spct);
                serial.setProductDetail(savedSpct);
                return serial;
            }).collect(Collectors.toList());

            // Lưu toàn bộ danh sách Serial bằng Batch Insert (cực kỳ tối ưu)
            adSerialRepository.saveAll(serialEntities);
        }

        // 4. Map thực thể vừa lưu sang Response
        ADProductDetailResponse response = mapToResponse(savedSpct);

        // Thêm serials vào response
        if (savedSpct.getSerials() != null && !savedSpct.getSerials().isEmpty()) {
            response.setSerials(savedSpct.getSerials().stream().map(s -> {
                ADSerialResponse serialRes = new ADSerialResponse();
                serialRes.setSerialNumber(s.getSerialNumber());
                serialRes.setStatus(s.getStatus());
                serialRes.setCreatedDate(Helper.formatDate(s.getCreatedDate()));
                return serialRes;
            }).collect(Collectors.toList()));
        } else {
            response.setSerials(new ArrayList<>());
        }
        return response;
    }

    @Override
    public ResponseObject<?> updateProductDetail(String id, ADProductDetailRequest request) {
        // 1. Kiểm tra sự tồn tại của SPCT
        ProductDetail productDetail = adProductDetailRepository.findByIdWithSerials(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm chi tiết không tồn tại"));

        // 2. Kiểm tra mã Code (Nếu đổi mã code, phải đảm bảo không trùng với SPCT khác)
        if (!productDetail.getCode().equals(request.getCode())) {
            if (adProductDetailRepository.existsByCode(request.getCode())) {
                return ResponseObject.error(HttpStatus.BAD_REQUEST, "Mã SPCT mới đã tồn tại");
            }
            productDetail.setCode(request.getCode());
        }

        // 3. Cập nhật các thông tin cơ bản
        // LEVEL 1: Auto-generate version name khi có variantVersion mới hoặc color/storage thay đổi
        String colorId = request.getColorId();
        String storageId = request.getStorageCapacityId();
        String colorName = productDetail.getColor() != null ? productDetail.getColor().getName() : "";
        String storageName = productDetail.getStorageCapacity() != null ? productDetail.getStorageCapacity().getName() : "";

        // Nếu color hoặc storage thay đổi, cập nhật lại tên
        if (colorId != null && !colorId.equals(productDetail.getColor() != null ? productDetail.getColor().getId() : null)) {
            colorName = adColorRepository.findById(colorId).map(c -> c.getName()).orElse(colorName);
        }
        if (storageId != null && !storageId.equals(productDetail.getStorageCapacity() != null ? productDetail.getStorageCapacity().getId() : null)) {
            storageName = adStorageCapacityRepository.findById(storageId).map(s -> s.getName()).orElse(storageName);
        }

        // Cập nhật variantVersion và regenerate version name
        String variantVersion = request.getVariantVersion();
        if (variantVersion == null || variantVersion.isBlank()) {
            variantVersion = ProductVersion.BODY_ONLY.name(); // Default
        }
        productDetail.setVariantVersion(variantVersion);
        String generatedVersion = ProductVersion.formatFullName(variantVersion, colorName, storageName);
        productDetail.setVersion(generatedVersion);

        productDetail.setNote(request.getNote());
        productDetail.setSalePrice(request.getSalePrice());
        productDetail.setStatus(request.getStatus());
        productDetail.setImageUrl(request.getImageUrl());


        productDetail.setSelectedImageId(request.getSelectedImageId());

        // 4. Cập nhật các quan hệ (Sử dụng đúng ID từ Request)
        productDetail.setProduct(adProductRepository.findById(request.getProductId()).orElse(productDetail.getProduct()));
        productDetail.setColor(adColorRepository.findById(request.getColorId()).orElse(productDetail.getColor()));
        productDetail.setStorageCapacity(adStorageCapacityRepository.findById(request.getStorageCapacityId()).orElse(productDetail.getStorageCapacity()));

        // 5. Xử lý cập nhật Serial (nếu có serials mới được gửi lên)
        if (request.getSerials() != null && !request.getSerials().isEmpty()) {
            // Validate serials mới không trùng với serial đã tồn tại trong hệ thống
            List<String> newSerialNumbers = request.getSerials().stream()
                    .map(ADSerialRequest::getSerialNumber)
                    .collect(Collectors.toList());

            // Kiểm tra serial mới có trùng với serial của biến thể khác không
            for (String serialNum : newSerialNumbers) {
                boolean existsOther = adSerialRepository.existsBySerialNumberAndProductDetailIdNot(serialNum, id);
                if (existsOther) {
                    return ResponseObject.error(HttpStatus.BAD_REQUEST, "Serial " + serialNum + " đã tồn tại trong biến thể khác!");
                }
            }

            // Xóa các serial cũ của biến thể này
            adSerialRepository.deleteByProductDetailId(id);

            // Thêm các serial mới
            List<Serial> newSerials = request.getSerials().stream().map(sReq -> {
                Serial serial = new Serial();
                serial.setSerialNumber(sReq.getSerialNumber());
                serial.setCreatedDate(System.currentTimeMillis());
                serial.setStatus(sReq.getStatus() != null ? sReq.getStatus() : EntityStatus.ACTIVE);
                serial.setProductDetail(productDetail);
                return serial;
            }).collect(Collectors.toList());

            adSerialRepository.saveAll(newSerials);

            // Cập nhật quantity theo số lượng serial mới
            productDetail.setQuantity(newSerialNumbers.size());
        }

        // 6. Lưu cập nhật
        adProductDetailRepository.save(productDetail);

        // 7. Map sang response và trả về (fetch lại để lấy serials)
        ProductDetail updatedPd = adProductDetailRepository.findByIdWithSerials(id).orElse(productDetail);
        ADProductDetailResponse response = mapToResponse(updatedPd);

        return ResponseObject.success(response, "Cập nhật sản phẩm chi tiết thành công");
    }
}
