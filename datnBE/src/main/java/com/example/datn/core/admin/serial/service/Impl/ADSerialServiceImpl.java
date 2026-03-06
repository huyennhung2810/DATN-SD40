package com.example.datn.core.admin.serial.service.Impl;

import com.example.datn.core.admin.serial.model.request.ADSerialRequest;
import com.example.datn.core.admin.serial.model.response.ADSerialResponse;
import com.example.datn.core.admin.serial.repository.ADSerialRepository;
import com.example.datn.core.admin.serial.service.ADSerialService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.ProductDetail;
import com.example.datn.entity.Serial;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.repository.ProductDetailRepository;
import com.example.datn.repository.SerialRepository;
import com.example.datn.utils.Helper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ADSerialServiceImpl implements ADSerialService {

    private final ADSerialRepository adSerialRepository;
    private final ProductDetailRepository productDetailRepository;

    @Override
    public ResponseObject<?> getAllSerials(String keyword, EntityStatus status) {
        List<Serial> list = adSerialRepository.searchSerials(keyword, status);

        List<ADSerialResponse> dtoList = list.stream().map(entity -> ADSerialResponse.builder()
                .id(entity.getId())
                .serialNumber(entity.getSerialNumber())
                .code(entity.getCode())
                .productName(
                        entity.getProductDetail() != null ? entity.getProductDetail().getProduct().getName() : "N/A")
                .createdDate(Helper.formatDate(entity.getCreatedDate()))
                .status(entity.getStatus())
                .serialStatus(entity.getSerialStatus())
                .build()).toList();

        return ResponseObject.success(dtoList, "Tìm kiếm thành công");
    }

    @Override
    public ResponseObject<?> findById(String id) {
        Serial serial = adSerialRepository.findById(id).orElse(null);

        if (serial == null) {
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy mã Serial này");
        }

        // Khởi tạo DTO với các giá trị mặc định
        ADSerialResponse response = ADSerialResponse.builder()
                .id(serial.getId())
                .serialNumber(serial.getSerialNumber())
                .code(serial.getCode())
                .status(serial.getStatus())
                .serialStatus(serial.getSerialStatus())
                .createdDate(Helper.formatDate(serial.getCreatedDate()))
                .build();

        // Kiểm tra null từng tầng một trước khi lấy tên sản phẩm
        if (serial.getProductDetail() != null) {
            response.setProductDetailId(serial.getProductDetail().getId());
            if (serial.getProductDetail().getProduct() != null) {
                response.setProductName(serial.getProductDetail().getProduct().getName());
            }
        }

        return ResponseObject.success(response, "Lấy thông tin thành công");
    }

    @Override
    public ResponseObject<?> findByProductDetailId(String productDetailId) {
        if (productDetailId == null) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Mã sản phầm chi tiết không được để trống");
        }
        Page<Serial> list = adSerialRepository.findByProductDetailId(productDetailId, PageRequest.of(0, 10));
        if (list.isEmpty()) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Không tìm thấy Serial cho dòng sản phẩm này");
        }
        List<ADSerialResponse> dtoList = list.stream().map(entity -> ADSerialResponse.builder()
                .id(entity.getId())
                .serialNumber(entity.getSerialNumber())
                .code(entity.getCode())
                .productName(entity.getProductDetail().getProduct().getName())
                .createdDate(Helper.formatDate(entity.getCreatedDate()))
                .status(entity.getStatus())
                .serialStatus(entity.getSerialStatus())
                .build()).toList();
        return ResponseObject.success(dtoList, "Hiển thị danh sách Serial theo mã " + productDetailId);
    }

    @Override
    public ResponseEntity<?> createSerial(ADSerialRequest request) {
        if (adSerialRepository.existsBySerialNumber(request.getSerialNumber())) {
            return ResponseEntity.badRequest().body(ResponseObject.error(HttpStatus.BAD_REQUEST, "Serial đã tồn tại"));
        }
        Serial serial = new Serial();
        serial.setSerialNumber(request.getSerialNumber());
        serial.setCode(request.getCode());

        ProductDetail productDetail = productDetailRepository.findById(request.getProductDetailId()).orElse(null);
        if (productDetail == null) {
            return ResponseEntity.badRequest().body(ResponseObject.error(HttpStatus.BAD_REQUEST, "SPCT đang bị trống"));
        }
        serial.setProductDetail(productDetail);
        serial.setStatus(request.getStatus());
        adSerialRepository.save(serial);
        return ResponseEntity.ok(ResponseObject.success(serial, "Thêm thành công Serial"));
    }

    @Override
    public ResponseEntity<?> updateSerial(String serialId, ADSerialRequest request) {
        Serial serial = adSerialRepository.findById(serialId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Serial cần sửa"));
        if (!serial.getSerialNumber().equals(request.getSerialNumber())
                && adSerialRepository.existsBySerialNumber(request.getSerialNumber())) {
            return ResponseEntity.badRequest().body(ResponseObject.error(HttpStatus.BAD_REQUEST, "Serial đã tồn tại"));
        }
        serial.setSerialNumber(request.getSerialNumber());
        serial.setCode(request.getCode());

        /*
         * Nhớ phải thêm ProductDetail Vào dây
         */

        ProductDetail productDetail = productDetailRepository.findById(request.getProductDetailId()).orElse(null);
        if (productDetail == null) {
            return ResponseEntity.badRequest().body(ResponseObject.error(HttpStatus.BAD_REQUEST, "SPCT đang bị trống"));
        }
        serial.setProductDetail(productDetail);
        adSerialRepository.save(serial);

        return ResponseEntity.ok(ResponseObject.success(serial, "Sửa thông tin thành công"));
    }

}
