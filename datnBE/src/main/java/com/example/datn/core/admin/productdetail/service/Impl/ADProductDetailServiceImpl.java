package com.example.datn.core.admin.productdetail.service.Impl;

import com.example.datn.core.admin.productdetail.model.request.ADProductDetailRequest;
import com.example.datn.core.admin.productdetail.model.response.ADProductDetailResponse;
import com.example.datn.core.admin.color.repository.ADColorRepository;
import com.example.datn.core.admin.productdetail.repository.ADProductDetailRepository;
import com.example.datn.core.admin.serial.model.request.ADSerialRequest;
import com.example.datn.core.admin.serial.model.response.ADSerialResponse;
import com.example.datn.core.admin.serial.repository.ADSerialRepository;
import com.example.datn.core.admin.storagecapacity.repository.ADStorageCapacityRepository;
import com.example.datn.core.admin.productdetail.service.ADProductDetailService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.ProductDetail;
import com.example.datn.entity.Serial;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.utils.Helper;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
    private final ADProductDetailRepository productDetailRepository;
    private final ADSerialRepository adSerialRepository;

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
    public ResponseObject<?> createProductDetail(ADProductDetailRequest request) {
        if (request.getCode() == null) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Mã SPCT không được để trống");
        }
        if (adProductDetailRepository.existsByCode(request.getCode())) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "MÃ SPCT đã tồn tại");
        }
        ProductDetail productDetail = new ProductDetail();
        productDetail.setCode(request.getCode());
        productDetail.setNote(request.getNote());
        productDetail.setVersion(request.getVersion());
        productDetail.setQuantity(request.getQuantity());
        productDetail.setSalePrice(request.getSalePrice());
        productDetail.setStatus(request.getStatus());

        productDetail.setColor(adColorRepository.findById(request.getProductId()).orElse(null));
        productDetail.setStorageCapacity(adStorageCapacityRepository.findById(request.getStorageCapacityId()).orElse(null));
        productDetail.setProduct(adProductDetailRepository.findById(request.getProductId()).orElseThrow().getProduct());

        List<Serial> serialEntities = new ArrayList<>();
        if (request.getSerials() != null && !request.getSerials().isEmpty()) {
            productDetail.setQuantity(request.getSerials().size());

            for (ADSerialRequest serialReq : request.getSerials()) {
                if (adSerialRepository.existsBySerialNumber(serialReq.getSerialNumber())) {
                    return ResponseObject.error(HttpStatus.BAD_REQUEST, "Số Serial " + serialReq.getSerialNumber() + " đã tồn tại");
                }

                Serial serial = new Serial();
                serial.setSerialNumber(serialReq.getSerialNumber());
                serial.setProductDetail(productDetail);
                serialEntities.add(serial);
            }
        } else {
            productDetail.setQuantity(request.getQuantity());
        }

        adProductDetailRepository.save(productDetail);
        if (!serialEntities.isEmpty()) {
            adSerialRepository.saveAll(serialEntities);
        }
        return ResponseObject.success(productDetail,"Thêm thành công SPCT");
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
