package com.example.datn.core.admin.techspec.service.Impl;

import com.example.datn.core.admin.techspec.model.request.ProcessorRequest;
import com.example.datn.core.admin.techspec.model.request.ProcessorSearchRequest;
import com.example.datn.core.admin.techspec.model.response.ProcessorResponse;
import com.example.datn.repository.ProcessorRepository;
import com.example.datn.core.admin.techspec.service.ProcessorService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.entity.Processor;
import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProcessorServiceImpl implements ProcessorService {

    private final ProcessorRepository repository;

    @Override
    public PageableObject<ProcessorResponse> search(ProcessorSearchRequest request) {
        int page = request.getPage() > 0 ? request.getPage() - 1 : 0;
        PageRequest pageRequest = PageRequest.of(page, request.getSize());
        Page<Processor> pageData = repository.search(
                request.getKeyword(),
                request.getStatus(),
                pageRequest
        );

        return new PageableObject<>(pageData.map(this::toResponse));
    }

    @Override
    @Transactional
    public ProcessorResponse create(ProcessorRequest request) {
        Processor entity = new Processor();
        mapRequestToEntity(request, entity);
        entity.setStatus(request.getStatus() != null ? request.getStatus() : EntityStatus.ACTIVE);

        return toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public ProcessorResponse update(String id, ProcessorRequest request) {
        Processor entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bộ xử lý"));

        mapRequestToEntity(request, entity);
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }

        return toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String id) {
        Processor entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bộ xử lý"));
        repository.delete(entity);
    }

    @Override
    public ProcessorResponse findById(String id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bộ xử lý"));
    }

    private void mapRequestToEntity(ProcessorRequest request, Processor entity) {
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
    }

    private ProcessorResponse toResponse(Processor entity) {
        ProcessorResponse response = new ProcessorResponse();
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

