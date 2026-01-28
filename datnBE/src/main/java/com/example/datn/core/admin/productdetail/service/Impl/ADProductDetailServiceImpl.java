package com.example.datn.core.admin.productdetail.service.Impl;

import com.example.datn.core.admin.productdetail.model.request.ADProductDetailRequest;
import com.example.datn.core.admin.productdetail.model.response.ADProductDetailResponse;
import com.example.datn.core.admin.color.repository.ADColorRepository;
import com.example.datn.core.admin.productdetail.repository.ADProductDetailRepository;
import com.example.datn.core.admin.storagecapacity.repository.ADStorageCapacityRepository;
import com.example.datn.core.admin.productdetail.service.ADProductDetailService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.ProductDetail;
import com.example.datn.utils.Helper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ADProductDetailServiceImpl implements ADProductDetailService {

    private final ADProductDetailRepository adProductDetailRepository;
    private final ADColorRepository adColorRepository;
    private final ADStorageCapacityRepository adStorageCapacityRepository;

        @Override
        public ResponseObject<?> getAllProductDetails() {
            Page<ProductDetail> list = adProductDetailRepository.findAll(PageRequest.of(0, 10));
    
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
    public ResponseObject<?> getAllProductDetailsByProductId(String productId) {
        if (productId == null) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Mã sản phẩm không được để trống");
        }
        Page<ProductDetail> list = adProductDetailRepository.findByProductId(productId, PageRequest.of(0, 10));
        if (list.isEmpty()) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Sản phẩm đã hết hàng");
        }
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
        return ResponseObject.success(dtoList,"Hiển thị danh sách sản phẩm chi tiết thành công theo mã SP " + productId);
    }

    @Override
    public ResponseObject<?> getAllProductDetailsByProductIdAndStatus(String productId) {
        return null;
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

//        Nhớ thêm phần Product
//        productDetail.setProduct();
        adProductDetailRepository.save(productDetail);
        return ResponseObject.success(productDetail,"Thêm thành công SPCT");
    }

    @Override
    public ResponseObject<?> updateProductDetail(String productDetailId, ADProductDetailRequest request) {
        ProductDetail productDetail = adProductDetailRepository.findById(productDetailId).orElseThrow(
                () -> new RuntimeException("Không tìm thấy SPCT"));
        if (!productDetail.getCode().equals(request.getCode()) && adProductDetailRepository.existsByCode(request.getCode())) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST,"Mã SPCT đã tồn tại");
        }
        productDetail.setCode(request.getCode());
        productDetail.setNote(request.getNote());
        productDetail.setVersion(request.getVersion());
        productDetail.setQuantity(request.getQuantity());
        productDetail.setSalePrice(request.getSalePrice());
        productDetail.setStatus(request.getStatus());
        productDetail.setColor(adColorRepository.findById(request.getProductId()).orElse(null));
        productDetail.setStorageCapacity(adStorageCapacityRepository.findById(request.getStorageCapacityId()).orElse(null));

//        Nhớ thêm phần Product
//        productDetail.setProduct();
        adProductDetailRepository.save(productDetail);

        return ResponseObject.success(productDetail, "Sửa thành công SPCT");
    }
}
