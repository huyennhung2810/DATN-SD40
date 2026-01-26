package com.example.datn.core.admin.customer.service.Impl;

import com.example.datn.core.admin.customer.model.request.ADColorRequest;
import com.example.datn.core.admin.customer.model.response.ADColorResponse;
import com.example.datn.core.admin.customer.repository.ADColorRepository;
import com.example.datn.core.admin.customer.service.ADColorService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.Color;
import com.example.datn.utils.Helper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ADColorServiceImpl implements ADColorService {

    private final ADColorRepository adColorRepository;

    public ADColorServiceImpl(ADColorRepository adColorRepository) {
        this.adColorRepository = adColorRepository;
    }

    @Override
    public ResponseObject<?> getAllColors() {
        List<Color> list = adColorRepository.findAll();

        List<ADColorResponse> dtoList = list.stream().map(entity->
                ADColorResponse.builder()
                        .id(entity.getId())
                        .code(entity.getCode())
                        .name(entity.getName())
                        .status(entity.getStatus())
                        .createdTime(Helper.formatDate(entity.getLastModifiedDate()))
                        .build()
        ).toList();

        return ResponseObject.success(dtoList, "Hiển thị danh sách Màu thành công");
    }

    @Override
    public ResponseObject<?> getColorByCode(String code) {
        return adColorRepository.findByCode(code).map(color-> {
            ADColorResponse response = ADColorResponse.builder()
                    .id(color.getId())
                    .code(color.getCode())
                    .name(color.getName())
                    .status(color.getStatus())
                    .createdTime(Helper.formatDate(color.getLastModifiedDate()))
                    .build();

            return ResponseObject.success(response, "Tìm thành công");

        }).orElseGet(() ->ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy màu có mã "+ code));
    }

    @Override
    public ResponseObject<?> createColor(ADColorRequest request) {
        if (adColorRepository.existsByCode(request.getCode())) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Mã màu đã tồn tại");
        }
        if (adColorRepository.existsByName(request.getName())) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Tên màu đã tồn tại");
        }

        Color color = new Color();
        color.setCode(request.getCode());
        color.setName(request.getName());
        color.setStatus(request.getStatus());
        adColorRepository.save(color);

        return ResponseObject.success(color, "Thêm thành công");
    }

    @Override
    public ResponseObject<?> updateColor(String colorId, ADColorRequest request) {
        Color color = adColorRepository.findById(colorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Màu đã chọn"));
        if (!color.getCode().equals(request.getCode()) && adColorRepository.existsByCode(request.getCode())) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Màu đã tồn tại");
        }

        color.setCode(request.getCode());
        color.setName(request.getName());
        color.setStatus(request.getStatus());
        adColorRepository.save(color);

        return ResponseObject.success(color, "Cập nhật thành công");
    }

    @Override
    public ResponseObject<?> deleteColor(String code) {
        adColorRepository.deleteById(code);
        return ResponseObject.success("Xóa thành công");
    }
}
