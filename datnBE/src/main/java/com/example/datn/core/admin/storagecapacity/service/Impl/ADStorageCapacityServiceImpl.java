package com.example.datn.core.admin.storagecapacity.service.Impl;

import com.example.datn.core.admin.storagecapacity.model.request.ADStorageCapacityRequest;
import com.example.datn.core.admin.color.model.response.ADColorResponse;
import com.example.datn.core.admin.storagecapacity.model.response.ADStorageCapacityResponse;
import com.example.datn.core.admin.storagecapacity.repository.ADStorageCapacityRepository;
import com.example.datn.core.admin.storagecapacity.service.ADStorageCapacityService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.StorageCapacity;
import com.example.datn.utils.Helper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ADStorageCapacityServiceImpl implements ADStorageCapacityService {

    private final ADStorageCapacityRepository adStorageCapacityRepository;

    @Override
    public ResponseObject<?> getAllStorageCapacity() {
        List<StorageCapacity> list = adStorageCapacityRepository.findAll();

        List<ADStorageCapacityResponse> dtoList = list.stream().map(entity->
                ADStorageCapacityResponse.builder()
                        .id(entity.getId())
                        .code(entity.getCode())
                        .name(entity.getName())
                        .status(entity.getStatus())
                        .createdTime(Helper.formatDate(entity.getCreatedDate()))
                        .build()
        ).toList();
        return ResponseObject.success(dtoList, "Hiển thị danh sách dung lượng thành công");
    }

    @Override
    public ResponseObject<?> getStorageCapacityByCode(String code) {
        return adStorageCapacityRepository.findByCode(code).map(entity-> {
            ADColorResponse response = ADColorResponse.builder()
                    .id(entity.getId())
                    .code(entity.getCode())
                    .name(entity.getName())
                    .status(entity.getStatus())
                    .createdTime(Helper.formatDate(entity.getCreatedDate()))
                    .build();

            return ResponseObject.success(response, "Tìm thành công");

        }).orElseGet(() ->ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy dung lượng có mã "+ code));
    }

    @Override
    public ResponseObject<?> createStorageCapacity(ADStorageCapacityRequest request) {
        if (adStorageCapacityRepository.existsByCode(request.getCode())) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Mã dung lượng đã tồn tại");
        }
        if (adStorageCapacityRepository.existsByName(request.getName())) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Dung lượng đã tồn tại");
        }

        StorageCapacity storageCapacity = new StorageCapacity();
        storageCapacity.setCode(request.getCode());
        storageCapacity.setName(request.getName());
        storageCapacity.setStatus(request.getStatus());
        adStorageCapacityRepository.save(storageCapacity);

        return ResponseObject.success(storageCapacity, "Thêm thành công");
    }

    @Override
    public ResponseObject<?> updateStorageCapacity(String storageCapacityId, ADStorageCapacityRequest request) {
        StorageCapacity storageCapacity = adStorageCapacityRepository.findById(storageCapacityId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Màu đã chọn"));
        if (!storageCapacity.getCode().equals(request.getCode()) && adStorageCapacityRepository.existsByCode(request.getCode())) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Màu đã tồn tại");
        }

        storageCapacity.setCode(request.getCode());
        storageCapacity.setName(request.getName());
        storageCapacity.setStatus(request.getStatus());
        adStorageCapacityRepository.save(storageCapacity);

        return ResponseObject.success(storageCapacity, "Cập nhật thành công");
    }

    @Override
    public ResponseObject<?> deleteStorageCapacity(String storageCapacityId) {
        adStorageCapacityRepository.deleteById(storageCapacityId);
        return ResponseObject.success("Xóa thành công");
    }
}
