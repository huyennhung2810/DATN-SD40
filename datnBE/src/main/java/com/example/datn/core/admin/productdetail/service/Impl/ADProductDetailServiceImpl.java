package com.example.datn.core.admin.productdetail.service.Impl;

import com.example.datn.core.admin.color.repository.ADColorRepository;

import com.example.datn.core.admin.product.model.response.ADProductImageSimpleResponse;
import com.example.datn.core.admin.product.repository.ADProductRepository;
import com.example.datn.core.admin.productdetail.model.request.ADProductDetailRequest;
import com.example.datn.core.admin.productdetail.model.request.BatchCreateProductDetailItemRequest;
import com.example.datn.core.admin.productdetail.model.request.BatchCreateProductDetailRequest;
import com.example.datn.core.admin.productdetail.model.response.ADProductDetailResponse;
import com.example.datn.core.admin.productdetail.model.response.BatchCreateProductDetailResponse;
import com.example.datn.core.admin.productdetail.model.response.BatchCreateProductDetailResponse.BatchCreatedItem;
import com.example.datn.core.admin.productdetail.model.response.BatchCreateProductDetailResponse.BatchCreateError;
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
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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

                    sRes.setSerialStatus(s.getSerialStatus());

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

        List<ProductImage> productImage = productImageRepository.findByProduct_Id(request.getProductId());

        if (productImage != null && !productImage.isEmpty()) {
            // Nếu có ảnh, lấy ảnh đầu tiên làm mặc định
            spct.setImageUrl(productImage.get(0).getUrl());
        } else {
            // Nếu không có ảnh nào, để null hoặc một đường dẫn ảnh mặc định
            spct.setImageUrl(null);
            // Hoặc: spct.setImageUrl("default-image.jpg");
        }
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

    @Override
    public BatchCreateProductDetailResponse batchCreateProductDetails(String productId,
            BatchCreateProductDetailRequest request) {

        List<BatchCreatedItem> createdItems = new ArrayList<>();
        List<BatchCreateError> errors = new ArrayList<>();
        List<ProductDetail> toSave = new ArrayList<>();

        // Load color & storage name lookups once
        var colorRepo = adColorRepository;
        var storageRepo = adStorageCapacityRepository;
        var productOpt = adProductRepository.findById(productId);

        if (productOpt.isEmpty()) {
            return BatchCreateProductDetailResponse.builder()
                    .success(false)
                    .message("Không tìm thấy sản phẩm")
                    .totalRequested(0)
                    .totalCreated(0)
                    .createdItems(createdItems)
                    .errors(List.of(BatchCreateError.builder()
                            .rowIndex(-1)
                            .field("productId")
                            .message("Không tìm thấy sản phẩm với ID: " + productId)
                            .build()))
                    .build();
        }

        var product = productOpt.get();

        // ----- PHASE 1: PRE-VALIDATE ALL ROWS -----
        Set<String> seenProductCodes = new HashSet<>();
        Set<String> allSerialsInBatch = new HashSet<>();

        for (int i = 0; i < request.getItems().size(); i++) {
            BatchCreateProductDetailItemRequest item = request.getItems().get(i);
            int rowIndex = i + 1;

            // 1a. Trùng mã SPCT trong chính batch
            if (seenProductCodes.contains(item.getProductCode())) {
                errors.add(BatchCreateError.builder()
                        .rowIndex(rowIndex)
                        .field("productCode")
                        .code(item.getProductCode())
                        .message("Mã SPCT '" + item.getProductCode() + "' bị trùng trong danh sách tạo")
                        .build());
            } else {
                seenProductCodes.add(item.getProductCode());
            }

            // 1b. Mã SPCT đã tồn tại trong DB
            if (adProductDetailRepository.existsByCode(item.getProductCode())) {
                errors.add(BatchCreateError.builder()
                        .rowIndex(rowIndex)
                        .field("productCode")
                        .code(item.getProductCode())
                        .message("Mã SPCT '" + item.getProductCode() + "' đã tồn tại trong hệ thống")
                        .build());
            }

            // 1c. Tổ hợp biến thể đã tồn tại trong DB
            if (adProductDetailRepository.existsByProductAndVariantAndColorAndStorage(
                    productId, item.getVersionId(), item.getColorId(), item.getStorageCapacityId())) {
                errors.add(BatchCreateError.builder()
                        .rowIndex(rowIndex)
                        .field("combination")
                        .message("Tổ hợp biến thể đã tồn tại: " + item.getVersionId()
                                + " / " + item.getColorId() + " / " + item.getStorageCapacityId())
                        .build());
            }

            // 1d. Validate serial trùng trong batch (cùng dòng)
            if (item.getSerials() != null && !item.getSerials().isEmpty()) {
                Set<String> serialsInRow = new HashSet<>();
                for (var serial : item.getSerials()) {
                    String sn = serial.getSerialNumber().trim();
                    if (serialsInRow.contains(sn)) {
                        errors.add(BatchCreateError.builder()
                                .rowIndex(rowIndex)
                                .field("serials")
                                .code(sn)
                                .message("Serial '" + sn + "' bị trùng trong cùng dòng")
                                .build());
                    } else {
                        serialsInRow.add(sn);
                        allSerialsInBatch.add(sn);
                    }
                }
            }
        }

        // 1e. Validate serial trùng giữa các dòng trong batch
        Set<String> seenSerialsBatch = new HashSet<>();
        for (int i = 0; i < request.getItems().size(); i++) {
            BatchCreateProductDetailItemRequest item = request.getItems().get(i);
            if (item.getSerials() == null) continue;
            for (var serial : item.getSerials()) {
                String sn = serial.getSerialNumber().trim();
                if (seenSerialsBatch.contains(sn)) {
                    errors.add(BatchCreateError.builder()
                            .rowIndex(i + 1)
                            .field("serials")
                            .code(sn)
                            .message("Serial '" + sn + "' bị trùng giữa các dòng trong batch")
                            .build());
                } else {
                    seenSerialsBatch.add(sn);
                }
            }
        }

        // 1f. Validate serial đã tồn tại trong DB
        if (!allSerialsInBatch.isEmpty()) {
            List<String> allSerials = new ArrayList<>(allSerialsInBatch);
            List<String> existingSerials = adSerialRepository.findExistingSerialNumbers(allSerials);
            for (String sn : existingSerials) {
                // Tìm row index chứa serial này
                for (int i = 0; i < request.getItems().size(); i++) {
                    BatchCreateProductDetailItemRequest item = request.getItems().get(i);
                    if (item.getSerials() != null) {
                        boolean found = item.getSerials().stream()
                                .anyMatch(s -> s.getSerialNumber().trim().equals(sn));
                        if (found) {
                            errors.add(BatchCreateError.builder()
                                    .rowIndex(i + 1)
                                    .field("serials")
                                    .code(sn)
                                    .message("Serial '" + sn + "' đã tồn tại trong hệ thống")
                                    .build());
                            break;
                        }
                    }
                }
            }
        }

        // ----- PHASE 2: REJECT ENTIRE BATCH IF ERRORS -----
        if (!errors.isEmpty()) {
            return BatchCreateProductDetailResponse.builder()
                    .success(false)
                    .message("Có " + errors.size() + " biến thể không hợp lệ — toàn batch bị từ chối")
                    .totalRequested(request.getItems().size())
                    .totalCreated(0)
                    .createdItems(new ArrayList<>())
                    .errors(errors)
                    .build();
        }

        // ----- PHASE 3: BUILD ENTITIES -----
        for (int i = 0; i < request.getItems().size(); i++) {
            BatchCreateProductDetailItemRequest item = request.getItems().get(i);

            String colorName = colorRepo.findById(item.getColorId())
                    .map(c -> c.getName()).orElse("");
            String storageName = storageRepo.findById(item.getStorageCapacityId())
                    .map(s -> s.getName()).orElse("");

            ProductDetail pd = new ProductDetail();
            pd.setCode(item.getProductCode());
            pd.setVariantVersion(item.getVersionId());
            pd.setVersion(ProductVersion.formatFullName(item.getVersionId(), colorName, storageName));
            pd.setSalePrice(item.getPrice());
            pd.setNote(item.getNote());
            pd.setStatus(EntityStatus.ACTIVE);
            pd.setProduct(product);
            pd.setColor(colorRepo.findById(item.getColorId()).orElse(null));
            pd.setStorageCapacity(storageRepo.findById(item.getStorageCapacityId()).orElse(null));

            // Quantity = số serial hợp lệ, 0 nếu không có serial
            int serialCount = item.getSerials() != null ? item.getSerials().size() : 0;
            pd.setQuantity(serialCount);

            // Set image từ sản phẩm mẹ
            List<ProductImage> productImages = productImageRepository.findByProduct_Id(productId);
            if (item.getImageUrl() != null && !item.getImageUrl().isBlank()) {
                pd.setImageUrl(item.getImageUrl());
            } else if (productImages != null && !productImages.isEmpty()) {
                pd.setImageUrl(productImages.get(0).getUrl());
            }

            toSave.add(pd);
        }

        // ----- PHASE 4: SAVE ALL -----
        List<ProductDetail> saved = adProductDetailRepository.saveAll(toSave);

        // ----- PHASE 5: SAVE SERIALS FOR EACH SAVED DETAIL -----
        for (int i = 0; i < saved.size(); i++) {
            ProductDetail pd = saved.get(i);
            BatchCreateProductDetailItemRequest item = request.getItems().get(i);

            if (item.getSerials() != null && !item.getSerials().isEmpty()) {
                List<Serial> serialEntities = item.getSerials().stream().map(sReq -> {
                    Serial serial = new Serial();
                    serial.setSerialNumber(sReq.getSerialNumber());
                    serial.setCode(sReq.getCode() != null && !sReq.getCode().isEmpty()
                            ? sReq.getCode()
                            : "SERIAL" + System.currentTimeMillis() + (int) (Math.random() * 1000));
                    serial.setCreatedDate(System.currentTimeMillis());
                    serial.setStatus(sReq.getStatus() != null ? sReq.getStatus() : EntityStatus.ACTIVE);
                    serial.setProductDetail(pd);
                    return serial;
                }).collect(Collectors.toList());

                adSerialRepository.saveAll(serialEntities);
            }

            createdItems.add(BatchCreatedItem.builder()
                    .rowIndex(i + 1)
                    .id(pd.getId())
                    .code(pd.getCode())
                    .version(pd.getVersion())
                    .colorName(pd.getColor() != null ? pd.getColor().getName() : "")
                    .storageCapacityName(pd.getStorageCapacity() != null ? pd.getStorageCapacity().getName() : "")
                    .serialCount(pd.getQuantity())
                    .build());
        }

        return BatchCreateProductDetailResponse.builder()
                .success(true)
                .message("Đã tạo " + createdItems.size() + " biến thể thành công!")
                .totalRequested(request.getItems().size())
                .totalCreated(createdItems.size())
                .createdItems(createdItems)
                .errors(new ArrayList<>())
                .build();
    }
}
