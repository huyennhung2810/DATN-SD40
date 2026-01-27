package com.example.datn.core.admin.customer.service.Impl;

import com.example.datn.core.admin.customer.model.request.ADSerialRequest;
import com.example.datn.core.admin.customer.model.response.ADSerialResponse;
import com.example.datn.core.admin.customer.repository.ADSerialRepository;
import com.example.datn.core.admin.customer.service.ADSerialService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.ProductDetail;
import com.example.datn.entity.Serial;
import com.example.datn.repository.ProductDetailRepository;
import com.example.datn.utils.Helper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ADSerialServiceImpl implements ADSerialService {

    private final ADSerialRepository adSerialRepository;
    private final ProductDetailRepository productDetailRepository;

    @Override
    public ResponseObject<?> getAllSerials() {
        List<Serial> list = adSerialRepository.findAll();

        List<ADSerialResponse> dtoList = list.stream().map(entity ->
            ADSerialResponse.builder()
                    .id(entity.getId())
                    .serialNumber(entity.getSerialNumber())
                    .code(entity.getCode())
                    .productName(entity.getProductDetail().getProduct().getName())
                    .createdDate(Helper.formatDate(entity.getCreatedDate()))
                    .status(entity.getStatus()).build()
        ).toList();
        return ResponseObject.success(dtoList,"Hiển thị danh sách Serial thành công");
    }

    @Override
    public ResponseObject<?> findByProductDetailId(String productDetailId) {
        if(productDetailId == null) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Mã sản phầm chi tiết không được để trống");
        }
        Page<Serial> list = adSerialRepository.findByProductDetailId(productDetailId, PageRequest.of(0, 10));
        if (list.isEmpty()) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Không tìm thấy Serial cho dòng sản phẩm này");
        }
        List<ADSerialResponse> dtoList = list.stream().map(entity ->
                ADSerialResponse.builder()
                        .id(entity.getId())
                        .serialNumber(entity.getSerialNumber())
                        .code(entity.getCode())
                        .productName(entity.getProductDetail().getProduct().getName())
                        .createdDate(Helper.formatDate(entity.getCreatedDate()))
                        .status(entity.getStatus()).build()
        ).toList();
        return ResponseObject.success(dtoList, "Hiển thị danh sách Serial theo mã " + productDetailId);
    }

    @Override
    public ResponseObject<?> createSerial(ADSerialRequest request) {
        if (adSerialRepository.existsBySerialNumber(request.getSerialNumber())) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST,"Serial đã tồn tại");
        }
        Serial serial = new Serial();
        serial.setSerialNumber(request.getSerialNumber());
        serial.setCode(request.getCode());

        /*
        Nhớ phải thêm ProductDetail Vào dây
         */
        ProductDetail productDetail = productDetailRepository.findById(request.getProductDetailId()).orElse(null);
        if (productDetail == null) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST,"SPCT đang bị trống");
        }
        serial.setProductDetail(productDetail);
        adSerialRepository.save(serial);


        return ResponseObject.success(serial, "Thêm thành công Serial");
    }

    @Override
    public ResponseObject<?> updateSerial(String serialId, ADSerialRequest request) {
        Serial serial = adSerialRepository.findById(serialId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Serial cần sửa"));
        if (serial.getSerialNumber().equals(request.getSerialNumber()) && adSerialRepository.existsBySerialNumber(request.getSerialNumber())) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST,"Serial đã tồn tại");
        }
        serial.setSerialNumber(request.getSerialNumber());
        serial.setCode(request.getCode());

        /*
        Nhớ phải thêm ProductDetail Vào dây
         */

        ProductDetail productDetail = productDetailRepository.findById(request.getProductDetailId()).orElse(null);
        if (productDetail == null) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST,"SPCT đang bị trống");
        }
        serial.setProductDetail(productDetail);
        adSerialRepository.save(serial);

        return ResponseObject.success(serial, "Sửa thông tin thành công");
    }
}
