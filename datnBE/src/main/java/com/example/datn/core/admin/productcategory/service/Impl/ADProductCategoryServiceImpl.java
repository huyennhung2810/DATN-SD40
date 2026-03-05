package com.example.datn.core.admin.productcategory.service.Impl;

import com.example.datn.core.admin.productcategory.model.request.ADProductCategoryRequest;
import com.example.datn.core.admin.productcategory.model.request.ADProductCategorySearchRequest;
import com.example.datn.core.admin.productcategory.model.response.ADProductCategoryResponse;
import com.example.datn.core.admin.productcategory.repository.ADProductCategoryRepository;
import com.example.datn.core.admin.productcategory.service.ADProductCategoryService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.entity.ProductCategory;
import com.example.datn.infrastructure.constant.EntityStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ADProductCategoryServiceImpl implements ADProductCategoryService {

    private final ADProductCategoryRepository repository;

    @Override
    public PageableObject<ADProductCategoryResponse> search(ADProductCategorySearchRequest request) {
        int page = request.getPage() > 0 ? request.getPage() - 1 : 0;
        PageRequest pageRequest = PageRequest.of(page, request.getSize());
        Page<ProductCategory> pageData = repository.search(
                request.getKeyword(),
                request.getStatus(),
                pageRequest
        );

        return new PageableObject<>(pageData.map(this::toResponse));
    }

    @Override
    @Transactional
    public ADProductCategoryResponse create(ADProductCategoryRequest request) {
        if (repository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Mã danh mục đã tồn tại");
        }

        ProductCategory entity = new ProductCategory();
        entity.setName(request.getName());
        entity.setCode(request.getCode());
        entity.setDescription(request.getDescription());
        // Nếu status là null, mặc định là ACTIVE
        entity.setStatus(request.getStatus() != null ? request.getStatus() : EntityStatus.ACTIVE);

        return toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public ADProductCategoryResponse update(String id, ADProductCategoryRequest request) {
        ProductCategory entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy danh mục"));

        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }

        return toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String id) {
        ProductCategory entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy danh mục"));
        repository.delete(entity);
    }

    @Override
    public ADProductCategoryResponse findById(String id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy danh mục"));
    }

    private ADProductCategoryResponse toResponse(ProductCategory entity) {
        ADProductCategoryResponse response = new ADProductCategoryResponse();
        response.setId(entity.getId());
        response.setCode(entity.getCode());
        response.setName(entity.getName());
        response.setDescription(entity.getDescription());
        response.setStatus(entity.getStatus());

        if (entity.getCreatedDate() != null) {
            response.setCreatedAt(entity.getCreatedDate());
        }
        if (entity.getLastModifiedDate() != null) {
            response.setUpdatedAt(entity.getLastModifiedDate());
        }
        return response;
    }
}