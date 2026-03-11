package com.example.datn.core.admin.productDetail.service.Impl;

import com.example.datn.core.admin.color.repository.ADColorRepository;
import com.example.datn.core.admin.product.model.response.ADProductImageSimpleResponse;
import com.example.datn.core.admin.product.repository.ADProductRepository;
import com.example.datn.core.admin.productDetail.model.request.ADProductDetailRequest;
import com.example.datn.core.admin.productDetail.model.response.ADProductDetailResponse;
import com.example.datn.core.admin.productDetail.repository.ADProductDetailRepository;
import com.example.datn.core.admin.productDetail.service.ADProductDetailService;
import com.example.datn.core.admin.serial.model.request.ADSerialRequest;
import com.example.datn.core.admin.serial.model.response.ADSerialResponse;
import com.example.datn.core.admin.serial.repository.ADSerialRepository;
import com.example.datn.core.admin.storagecapacity.repository.ADStorageCapacityRepository;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.ProductDetail;
import com.example.datn.entity.ProductImage;
import com.example.datn.entity.Serial;
import com.example.datn.infrastructure.constant.EntityStatus;
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

        List<ADProductDetailResponse> dtoList = list.stream().map(entity ->
                mapToResponse(entity)
        ).toList();
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

        return ADProductDetailResponse.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .note(entity.getNote())
                .version(entity.getVersion())
                .quantity(entity.getQuantity())
                .salePrice(entity.getSalePrice())
                .status(entity.getStatus())
                .colorId(entity.getColor() != null ? entity.getColor().getId() : null)
                .colorName(entity.getColor() != null ? entity.getColor().getName() : "")
                .productId(entity.getProduct() != null ? entity.getProduct().getId() : null)
                .productName(entity.getProduct() != null ? entity.getProduct().getName() : "")
                .storageCapacityId(entity.getStorageCapacity() != null ? entity.getStorageCapacity().getId() : null)
                .storageCapacityName(entity.getStorageCapacity() != null ? entity.getStorageCapacity().getName() : "")
                .creationDate(Helper.formatDate(entity.getCreatedDate()))
                .imageUrl(entity.getImageUrl())
                .selectedImageId(entity.getSelectedImageId())
                .selectedImage(selectedImage)
                .build();
    }

    @Override
    public ResponseObject<?> getById(String id) {
        ProductDetail pd = adProductDetailRepository.findById(id)
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
        spct.setVersion(request.getVersion());
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
                serial.setCreatedDate(System.currentTimeMillis());
                serial.setStatus(sReq.getStatus());
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

    public ResponseObject<?> updateProductDetail(String id, ADProductDetailRequest request) {
        // 1. Kiểm tra sự tồn tại của SPCT
        ProductDetail productDetail = adProductDetailRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm chi tiết không tồn tại"));

        // 2. Kiểm tra mã Code (Nếu đổi mã code, phải đảm bảo không trùng với SPCT khác)
        if (!productDetail.getCode().equals(request.getCode())) {
            if (adProductDetailRepository.existsByCode(request.getCode())) {
                return ResponseObject.error(HttpStatus.BAD_REQUEST, "Mã SPCT mới đã tồn tại");
            }
            productDetail.setCode(request.getCode());
        }

        // Validate selectedImageId - phải thuộc về sản phẩm mẹ
        if (request.getSelectedImageId() != null && !request.getSelectedImageId().isEmpty()) {
            ProductImage selectedImage = productImageRepository.findById(request.getSelectedImageId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy ảnh với ID: " + request.getSelectedImageId()));

            // Kiểm tra ảnh có thuộc sản phẩm mẹ không
            String productId = productDetail.getProduct() != null ? productDetail.getProduct().getId() : null;
            if (productId != null && (selectedImage.getProduct() == null || !selectedImage.getProduct().getId().equals(productId))) {
                throw new RuntimeException("Ảnh được chọn không thuộc sản phẩm mẹ này!");
            }
        }

        // 3. Cập nhật các thông tin cơ bản
        productDetail.setVersion(request.getVersion());
        productDetail.setNote(request.getNote());
        productDetail.setSalePrice(request.getSalePrice());
        productDetail.setStatus(request.getStatus());
        productDetail.setImageUrl(request.getImageUrl());

        // Cập nhật selectedImageId - ảnh được chọn từ sản phẩm mẹ
        productDetail.setSelectedImageId(request.getSelectedImageId());

        // 4. Cập nhật các quan hệ (Sử dụng đúng ID từ Request)
        //productDetail.setProduct(adProductRepository.findById(request.getProductId()).orElse(productDetail.getProduct()));
        productDetail.setColor(adColorRepository.findById(request.getColorId()).orElse(productDetail.getColor()));
        productDetail.setStorageCapacity(adStorageCapacityRepository.findById(request.getStorageCapacityId()).orElse(productDetail.getStorageCapacity()));

        // 5. Lưu cập nhật
        adProductDetailRepository.save(productDetail);

        // 6. Map sang response và trả về
        ADProductDetailResponse response = mapToResponse(productDetail);

        return ResponseObject.success(response, "Cập nhật sản phẩm chi tiết thành công");
    }
}
