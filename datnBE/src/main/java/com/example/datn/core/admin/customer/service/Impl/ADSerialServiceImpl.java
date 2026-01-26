package com.example.datn.core.admin.customer.service.Impl;

import com.example.datn.core.admin.customer.model.request.ADSerialRequest;
import com.example.datn.core.admin.customer.repository.ADSerialRepository;
import com.example.datn.core.admin.customer.service.ADSerialService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.Serial;
import com.example.datn.repository.SerialRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ADSerialServiceImpl implements ADSerialService {

    private final ADSerialRepository adSerialRepository;

    public ADSerialServiceImpl(ADSerialRepository adSerialRepository) {
        this.adSerialRepository = adSerialRepository;
    }


    @Override
    public ResponseObject<?> getAllSerials() {
        List<Serial> list = adSerialRepository.findAll();
        return ResponseObject.success(list,"Hiển thị danh sách Serial thành công");
    }

    @Override
    public ResponseObject<?> findByProductDetailId(String productDetailId) {
        if(productDetailId == null) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Mã sản phầm chi tiết không được để trống");
        }
        return ResponseObject.success("Hiển thị danh sách Serial theo mã" + productDetailId);
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
        //serial.setProductDetail();

        adSerialRepository.save(serial);
        return ResponseObject.success("Thêm thành công Serial");
    }

    @Override
    public ResponseObject<?> updateSerial(String serialId, ADSerialRequest request) {
        Serial serial = adSerialRepository.findById(serialId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Serial cần sửa"));
        if (!serial.getSerialNumber().equals(request.getSerialNumber()) && adSerialRepository.existsBySerialNumber(request.getSerialNumber())) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST,"Serial đã tồn tại");
        }
        serial.setSerialNumber(request.getSerialNumber());
        serial.setCode(request.getCode());

        /*
        Nhớ phải thêm ProductDetail Vào dây
         */
        //serial.setProductDetail();

        adSerialRepository.save(serial);
        return ResponseObject.success("Sửa thông tin thành công");
    }
}
