package com.example.datn.core.admin.productDetail.service.Impl;

import com.example.datn.core.admin.color.repository.ADColorRepository;
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
import com.example.datn.entity.Serial;
import com.example.datn.infrastructure.constant.EntityStatus;
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

        @Override
        public ResponseObject<?> getAllProductDetails(String keyword, EntityStatus status) {
            List<ProductDetail> list = adProductDetailRepository.searchProductDetail(keyword, status);
    
            List<ADProductDetailResponse> dtoList = list.stream().map(entity->
                    ADProductDetailResponse.builder()
                            .id(entity.getId())
                            .code(entity.getCode())
                            .note(entity.getNote())
                            .version(entity.getVersion())
                            .quantity(entity.getQuantity())
                            .salePrice(entity.getSalePrice())
                            .status(entity.getStatus())
                            .colorName(entity.getColor().getName())
                            .productName(entity.getProduct().getName())
                            .storageCapacityName(entity.getStorageCapacity().getName())
                            .creationDate(Helper.formatDate(entity.getCreatedDate())).build()
                    ).toList();
            return ResponseObject.success(dtoList,"Hiển thị danh sách sản phẩm chi tiết thành công");
        }

    @Override
    public ResponseObject<?> getById(String id) {
        ProductDetail pd = adProductDetailRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy SPCT"));

        // Convert sang Response DTO
        ADProductDetailResponse response = ADProductDetailResponse.builder()
                .id(pd.getId())
                .code(pd.getCode())
                .version(pd.getVersion())
                .salePrice(pd.getSalePrice())
                .quantity(pd.getQuantity())
                .status(pd.getStatus())
                .colorName(pd.getColor() != null ? pd.getColor().getName() : "")
                .productName(pd.getProduct() != null ? pd.getProduct().getName() : "")
                .storageCapacityName(pd.getStorageCapacity() != null ? pd.getStorageCapacity().getName() : "")
                // MAP LIST SERIAL Ở ĐÂY
                .serials(pd.getSerials().stream().map(s -> {
                    ADSerialResponse sRes = new ADSerialResponse();
                    sRes.setSerialNumber(s.getSerialNumber());
                    // sRes.setCode(s.getSerialCode());
                    return sRes;
                }).collect(Collectors.toList()))
                .build();

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

        // LƯU SPCT LẦN 1: Để Database sinh ra ID cho cái SPCT này
        ProductDetail savedSpct = adProductDetailRepository.save(spct);

        // 3. Xử lý lưu mảng Serial
        if (request.getSerials() != null && !request.getSerials().isEmpty()) {
            List<Serial> serialEntities = request.getSerials().stream().map(sReq -> {
                Serial serial = new Serial();
                serial.setSerialNumber(sReq.getSerialNumber());
                serial.setCode(sReq.getCode());
                serial.setStatus(sReq.getStatus());

                // Gán ID của SPCT vừa tạo vào Serial
                serial.setProductDetail(savedSpct);
                return serial;
            }).collect(Collectors.toList());

            // Lưu toàn bộ danh sách Serial bằng Batch Insert (cực kỳ tối ưu)
            adSerialRepository.saveAll(serialEntities);
        }

        // 4. Map thực thể vừa lưu sang Response (bạn tự gọi hàm map của bạn)
         ADProductDetailResponse response = ADProductDetailResponse.builder()
                .id(savedSpct.getId())
                .code(savedSpct.getCode())
                .version(savedSpct.getVersion())
                .salePrice(savedSpct.getSalePrice())
                .quantity(savedSpct.getQuantity())
                .status(savedSpct.getStatus())

                // 1. MAP PRODUCT (Bắt buộc phải có Id cho Frontend)
                .productId(savedSpct.getProduct() != null ? savedSpct.getProduct().getId() : null)
                .productName(savedSpct.getProduct() != null ? savedSpct.getProduct().getName() : "")

                // 2. MAP COLOR (Bắt buộc phải có Id)
                .colorId(savedSpct.getColor() != null ? savedSpct.getColor().getId() : null)
                .colorName(savedSpct.getColor() != null ? savedSpct.getColor().getName() : "")

                // 3. MAP STORAGE CAPACITY (Bắt buộc phải có Id)
                .storageCapacityId(savedSpct.getStorageCapacity() != null ? savedSpct.getStorageCapacity().getId() : null)
                .storageCapacityName(savedSpct.getStorageCapacity() != null ? savedSpct.getStorageCapacity().getName() : "")

                // 4. MAP LIST SERIAL (Đã fix lỗi NullPointerException)
                .serials(savedSpct.getSerials() != null
                        ? savedSpct.getSerials().stream().map(s -> {
                    ADSerialResponse sRes = new ADSerialResponse();
                    sRes.setSerialNumber(s.getSerialNumber());
                    // sRes.setCode(s.getSerialCode());
                    return sRes;
                }).collect(Collectors.toList())
                        : new ArrayList<>())
                .build();;

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

        // 3. Cập nhật các thông tin cơ bản
        productDetail.setVersion(request.getVersion());
        productDetail.setNote(request.getNote());
        productDetail.setSalePrice(request.getSalePrice());
        productDetail.setStatus(request.getStatus());

        // 4. Cập nhật các quan hệ (Sử dụng đúng ID từ Request)
        //productDetail.setProduct(adProductRepository.findById(request.getProductId()).orElse(productDetail.getProduct()));
        productDetail.setColor(adColorRepository.findById(request.getColorId()).orElse(productDetail.getColor()));
        productDetail.setStorageCapacity(adStorageCapacityRepository.findById(request.getStorageCapacityId()).orElse(productDetail.getStorageCapacity()));

        // 5. Lưu cập nhật
        adProductDetailRepository.save(productDetail);

        return ResponseObject.success(productDetail, "Cập nhật sản phẩm chi tiết thành công");
    }
}
