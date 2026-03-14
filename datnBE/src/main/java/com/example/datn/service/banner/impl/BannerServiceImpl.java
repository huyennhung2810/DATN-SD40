package com.example.datn.service.banner.impl;

import com.example.datn.entity.Banner;
import com.example.datn.infrastructure.constant.BannerPosition;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.LinkTarget;
import com.example.datn.infrastructure.exception.ResourceNotFoundException;
import com.example.datn.infrastructure.exception.ValidationException;
import com.example.datn.repository.BannerRepository;
import com.example.datn.service.banner.BannerCacheService;
import com.example.datn.service.banner.BannerService;
import com.example.datn.service.banner.dto.BannerMapper;
import com.example.datn.service.banner.dto.BannerRequest;
import com.example.datn.service.banner.dto.BannerResponse;
import com.example.datn.service.banner.dto.BannerSearchRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BannerServiceImpl implements BannerService {

    private final BannerRepository bannerRepository;
    private final BannerMapper bannerMapper;
    private final BannerCacheService bannerCacheService;

    @Override
    @Transactional
    @CacheEvict(value = {"banners", "allActiveBanners"}, allEntries = true)
    public BannerResponse create(BannerRequest request) {
        validateBannerRequest(request, null);

        Banner banner = bannerMapper.toEntity(request);
        banner.setCode(generateCode());
        banner.setStatus(EntityStatus.ACTIVE);

        Banner savedBanner = bannerRepository.save(banner);
        return bannerMapper.toResponse(savedBanner);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"banners", "allActiveBanners"}, allEntries = true)
    public BannerResponse update(String id, BannerRequest request) {
        Banner existingBanner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner không tồn tại với id: " + id));

        validateBannerRequest(request, id);

        bannerMapper.updateEntity(existingBanner, request);

        Banner updatedBanner = bannerRepository.save(existingBanner);
        return bannerMapper.toResponse(updatedBanner);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"banners", "allActiveBanners"}, allEntries = true)
    public void delete(String id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner không tồn tại với id: " + id));

        banner.setStatus(EntityStatus.INACTIVE);
        bannerRepository.save(banner);
    }

    @Override
    public BannerResponse findById(String id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner không tồn tại với id: " + id));
        return bannerMapper.toResponse(banner);
    }

    @Override
    public Page<BannerResponse> search(BannerSearchRequest request) {
        Integer reqPage = request.getPage();
        Integer reqSize = request.getSize();

        int page = reqPage != null ? reqPage : 0;
        int size = reqSize != null ? reqSize : 10;

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdDate"));

        Specification<Banner> spec = buildSpecification(request);

        Page<Banner> bannerPage = bannerRepository.findAll(spec, pageable);
        return bannerPage.map(bannerMapper::toResponse);
    }
    @Override
    public List<BannerResponse> getBannersByPosition(BannerPosition position) {
        return bannerCacheService.getCachedBannersByPosition(position);
    }

    @Override
    public List<BannerResponse> getAllActiveBanners() {
        return bannerCacheService.getCachedAllActiveBanners();
    }

    @Override
    @Transactional
    @CacheEvict(value = {"banners", "allActiveBanners"}, allEntries = true)
    public void updateStatus(String id, Integer status) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner không tồn tại với id: " + id));

        if (status == 0) {
            banner.setStatus(EntityStatus.INACTIVE);
        } else if (status == 1) {
            banner.setStatus(EntityStatus.ACTIVE);
        } else {
            throw new ValidationException("Status chỉ nhận giá trị 0 hoặc 1");
        }

        bannerRepository.save(banner);
    }

    private void validateBannerRequest(BannerRequest request, String excludeId) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new ValidationException("Tiêu đề không được để trống");
        }

        if (request.getPosition() == null) {
            throw new ValidationException("Vị trí không được để trống");
        }

        if (request.getType() == null) {
            throw new ValidationException("Loại banner không được để trống");
        }

        if (request.getImageUrl() == null || request.getImageUrl().trim().isEmpty()) {
            throw new ValidationException("Ảnh desktop không được để trống");
        }

        if (request.getStartAt() != null && request.getEndAt() != null) {
            if (request.getStartAt().isAfter(request.getEndAt())) {
                throw new ValidationException("Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
            }
        }

        if (request.getPriority() != null && request.getPriority() < 0) {
            throw new ValidationException("Priority phải là số nguyên dương");
        }

        if (request.getLinkTarget() != null) {
            try {
                LinkTarget.valueOf(request.getLinkTarget().name());
            } catch (IllegalArgumentException e) {
                throw new ValidationException("LinkTarget chỉ nhận giá trị NEW_TAB hoặc SAME_TAB");
            }
        }
    }

    private Specification<Banner> buildSpecification(BannerSearchRequest request) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (request.getKeyword() != null && !request.getKeyword().trim().isEmpty()) {
                String keyword = "%" + request.getKeyword().trim() + "%";
                predicates.add(cb.or(
                    cb.like(root.get("title"), keyword),
                    cb.like(root.get("subtitle"), keyword),
                    cb.like(root.get("description"), keyword)
                ));
            }

            if (request.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), request.getStatus()));
            }

            if (request.getPosition() != null) {
                predicates.add(cb.equal(root.get("position"), request.getPosition()));
            }

            if (request.getType() != null) {
                predicates.add(cb.equal(root.get("type"), request.getType()));
            }

            query.orderBy(cb.desc(root.get("priority")), cb.desc(root.get("createdDate")));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private String generateCode() {
        return "BN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
