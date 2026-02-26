package com.example.datn.core.admin.techspec.service.Impl;

import com.example.datn.core.admin.techspec.model.request.VideoFormatRequest;
import com.example.datn.core.admin.techspec.model.request.VideoFormatSearchRequest;
import com.example.datn.core.admin.techspec.model.response.VideoFormatResponse;
import com.example.datn.repository.VideoFormatRepository;
import com.example.datn.core.admin.techspec.service.VideoFormatService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.entity.VideoFormat;
import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VideoFormatServiceImpl implements VideoFormatService {

    private final VideoFormatRepository repository;

    @Override
    public PageableObject<VideoFormatResponse> search(VideoFormatSearchRequest request) {
        int page = request.getPage() > 0 ? request.getPage() - 1 : 0;
        PageRequest pageRequest = PageRequest.of(page, request.getSize());
        Page<VideoFormat> pageData = repository.search(
                request.getKeyword(),
                request.getStatus(),
                pageRequest
        );

        return new PageableObject<>(pageData.map(this::toResponse));
    }

    @Override
    @Transactional
    public VideoFormatResponse create(VideoFormatRequest request) {
        VideoFormat entity = new VideoFormat();
        mapRequestToEntity(request, entity);
        entity.setStatus(request.getStatus() != null ? request.getStatus() : EntityStatus.ACTIVE);

        return toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public VideoFormatResponse update(String id, VideoFormatRequest request) {
        VideoFormat entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy định dạng video"));

        mapRequestToEntity(request, entity);
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }

        return toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String id) {
        VideoFormat entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy định dạng video"));
        repository.delete(entity);
    }

    @Override
    public VideoFormatResponse findById(String id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy định dạng video"));
    }

    private void mapRequestToEntity(VideoFormatRequest request, VideoFormat entity) {
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
    }

    private VideoFormatResponse toResponse(VideoFormat entity) {
        VideoFormatResponse response = new VideoFormatResponse();
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

