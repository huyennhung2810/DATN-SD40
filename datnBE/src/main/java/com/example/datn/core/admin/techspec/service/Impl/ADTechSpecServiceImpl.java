package com.example.datn.core.admin.techspec.service.Impl;

import com.example.datn.core.admin.techspec.model.request.ADTechSpecRequest;
import com.example.datn.core.admin.techspec.model.request.ADTechSpecSearchRequest;
import com.example.datn.core.admin.techspec.model.response.ADTechSpecResponse;
import com.example.datn.core.admin.techspec.repository.ADTechSpecRepository;
import com.example.datn.core.admin.techspec.service.ADTechSpecService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.entity.TechSpec;
import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ADTechSpecServiceImpl implements ADTechSpecService {

    private final ADTechSpecRepository repository;

    @Override
    public PageableObject<ADTechSpecResponse> search(ADTechSpecSearchRequest request) {
        int page = request.getPage() > 0 ? request.getPage() - 1 : 0;
        PageRequest pageRequest = PageRequest.of(page, request.getSize());
        Page<TechSpec> pageData = repository.search(
            request.getKeyword(),
            request.getStatus(),
            pageRequest
        );
        
        return new PageableObject<>(pageData.map(this::toResponse));
    }

    @Override
    @Transactional
    public ADTechSpecResponse create(ADTechSpecRequest request) {
        TechSpec entity = new TechSpec();
        mapRequestToEntity(request, entity);
        entity.setStatus(request.getStatus() != null ? request.getStatus() : EntityStatus.ACTIVE);
        
        return toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public ADTechSpecResponse update(String id, ADTechSpecRequest request) {
        TechSpec entity = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông số kỹ thuật"));
        
        mapRequestToEntity(request, entity);
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }
        
        return toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String id) {
        TechSpec entity = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông số kỹ thuật"));
        repository.delete(entity);
    }

    @Override
    public ADTechSpecResponse findById(String id) {
        return repository.findById(id)
            .map(this::toResponse)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông số kỹ thuật"));
    }

    private void mapRequestToEntity(ADTechSpecRequest request, TechSpec entity) {
        entity.setSensorType(request.getSensorType());
        entity.setLensMount(request.getLensMount());
        entity.setResolution(request.getResolution());
        entity.setIso(request.getIso());
        entity.setProcessor(request.getProcessor());
        entity.setImageFormat(request.getImageFormat());
        entity.setVideoFormat(request.getVideoFormat());
    }

    private ADTechSpecResponse toResponse(TechSpec entity) {
        ADTechSpecResponse response = new ADTechSpecResponse();
        response.setId(entity.getId());
        response.setSensorType(entity.getSensorType());
        response.setLensMount(entity.getLensMount());
        response.setResolution(entity.getResolution());
        response.setIso(entity.getIso());
        response.setProcessor(entity.getProcessor());
        response.setImageFormat(entity.getImageFormat());
        response.setVideoFormat(entity.getVideoFormat());
        response.setStatus(entity.getStatus());

        response.setCreatedAt(entity.getCreatedDate());
        response.setUpdatedAt(entity.getLastModifiedDate());
        return response;
    }
}