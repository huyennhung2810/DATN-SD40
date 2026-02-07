package com.example.datn.core.admin.techspec.service.Impl;

import com.example.datn.core.admin.techspec.model.request.ImageFormatRequest;
import com.example.datn.core.admin.techspec.model.request.ImageFormatSearchRequest;
import com.example.datn.core.admin.techspec.model.response.ImageFormatResponse;
import com.example.datn.repository.ImageFormatRepository;
import com.example.datn.core.admin.techspec.service.ImageFormatService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.entity.ImageFormat;
import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ImageFormatServiceImpl implements ImageFormatService {

    private final ImageFormatRepository repository;

    @Override
    public PageableObject<ImageFormatResponse> search(ImageFormatSearchRequest request) {
        int page = request.getPage() > 0 ? request.getPage() - 1 : 0;
        PageRequest pageRequest = PageRequest.of(page, request.getSize());
        Page<ImageFormat> pageData = repository.search(
                request.getKeyword(),
                request.getStatus(),
                pageRequest
        );

        return new PageableObject<>(pageData.map(this::toResponse));
    }

    @Override
    @Transactional
    public ImageFormatResponse create(ImageFormatRequest request) {
        ImageFormat entity = new ImageFormat();
        mapRequestToEntity(request, entity);
        entity.setStatus(request.getStatus() != null ? request.getStatus() : EntityStatus.ACTIVE);

        return toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public ImageFormatResponse update(String id, ImageFormatRequest request) {
        ImageFormat entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy định dạng ảnh"));

        mapRequestToEntity(request, entity);
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }

        return toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String id) {
        ImageFormat entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy định dạng ảnh"));
        repository.delete(entity);
    }

    @Override
    public ImageFormatResponse findById(String id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy định dạng ảnh"));
    }

    private void mapRequestToEntity(ImageFormatRequest request, ImageFormat entity) {
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
    }

    private ImageFormatResponse toResponse(ImageFormat entity) {
        ImageFormatResponse response = new ImageFormatResponse();
        response.setId(entity.getId());
        response.setName(entity.getName());
        response.setDescription(entity.getDescription());
        response.setCode(entity.getCode());
        response.setStatus(entity.getStatus());
        response.setCreatedAt(entity.getCreatedDate());
        response.setUpdatedAt(entity.getLastModifiedDate());
        return response;
    }
}

