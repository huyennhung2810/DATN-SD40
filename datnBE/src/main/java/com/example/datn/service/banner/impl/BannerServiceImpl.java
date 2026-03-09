package com.example.datn.service.banner.impl;

import com.example.datn.dto.banner.BannerRequest;
import com.example.datn.dto.banner.BannerResponse;
import com.example.datn.dto.banner.BannerSearchRequest;
import com.example.datn.entity.Banner;
import com.example.datn.infrastructure.constant.BannerPosition;
import com.example.datn.infrastructure.constant.BannerType;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.LinkTarget;
import com.example.datn.infrastructure.exception.ServiceException;
import com.example.datn.infrastructure.exception.ValidationException;
import com.example.datn.repository.BannerRepository;
import com.example.datn.service.banner.BannerService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class BannerServiceImpl implements BannerService {

    private final BannerRepository bannerRepository;

    private static final int MAX_PRIORITY = 9999;
    private static final int MIN_PRIORITY = 0;
    private static final Pattern URL_PATTERN = Pattern.compile(
            "^(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*/?$",
            Pattern.CASE_INSENSITIVE
    );

    @Override
    public Page<BannerResponse> search(BannerSearchRequest request) {
        Pageable pageable = PageRequest.of(
                request.getPage(),
                request.getSize(),
                Sort.by(Sort.Direction.fromString(request.getSortDirection()), request.getSortBy())
        );

        Specification<Banner> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(request.getKeyword())) {
                String keyword = "%" + request.getKeyword().trim() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), keyword),
                        cb.like(cb.lower(root.get("subtitle")), keyword),
                        cb.like(cb.lower(root.get("description")), keyword)
                ));
            }

            if (request.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), request.getStatus()));
            }

            if (request.getPosition() != null) {
                predicates.add(cb.equal(root.get("position"), request.getPosition()));
            }

            if (request.getStartDateFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("startAt"), request.getStartDateFrom()));
            }

            if (request.getStartDateTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("startAt"), request.getStartDateTo()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return bannerRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    public BannerResponse getById(String id) throws ServiceException {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ServiceException("Banner không tồn tại"));
        return toResponse(banner);
    }

    @Override
    @Transactional
    public BannerResponse create(BannerRequest request) throws ValidationException, ServiceException {
        validateBannerRequest(request, null);

        Banner banner = new Banner();
        mapRequestToEntity(banner, request);
        banner.setStatus(EntityStatus.ACTIVE);

        Banner saved = bannerRepository.save(banner);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public BannerResponse update(String id, BannerRequest request) throws ValidationException, ServiceException {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ServiceException("Banner không tồn tại"));

        validateBannerRequest(request, id);

        mapRequestToEntity(banner, request);

        Banner saved = bannerRepository.save(banner);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(String id) throws ServiceException {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ServiceException("Banner không tồn tại"));

        banner.setStatus(EntityStatus.INACTIVE);
        bannerRepository.save(banner);
    }

    @Override
    @Transactional
    public BannerResponse changeStatus(String id, EntityStatus status) throws ServiceException {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ServiceException("Banner không tồn tại"));

        banner.setStatus(status);
        Banner saved = bannerRepository.save(banner);
        return toResponse(saved);
    }

    @Override
    public List<BannerResponse> getActiveBanners(BannerPosition position) {
        LocalDateTime now = LocalDateTime.now();
        List<Banner> banners;

        if (position != null) {
            banners = bannerRepository.findActiveBannersByPosition(
                    EntityStatus.ACTIVE, position, now
            );
        } else {
            banners = bannerRepository.findAllActiveBanners(EntityStatus.ACTIVE, now);
        }

        return banners.stream().map(this::toResponse).toList();
    }

    @Override
    public List<BannerResponse> getAllActiveBanners() {
        return getActiveBanners(null);
    }

    private void validateBannerRequest(BannerRequest request, String excludeId) throws ValidationException {
        List<String> errors = new ArrayList<>();

        // Validate title
        if (!StringUtils.hasText(request.getTitle())) {
            errors.add("Tiêu đề banner không được để trống");
        } else {
            String title = request.getTitle().trim();
            if (title.length() < 2) {
                errors.add("Tiêu đề banner phải có ít nhất 2 ký tự");
            }
            if (title.length() > 200) {
                errors.add("Tiêu đề banner không được vượt quá 200 ký tự");
            }
            if (!title.matches(".*\\S.*")) {
                errors.add("Tiêu đề banner không được chỉ chứa khoảng trắng");
            }
        }

        // Validate imageUrl
        if (!StringUtils.hasText(request.getImageUrl())) {
            errors.add("Ảnh banner không được để trống");
        }

        // Validate position
        if (request.getPosition() == null) {
            errors.add("Vị trí banner không được để trống");
        }

        // Validate priority
        if (request.getPriority() != null) {
            if (request.getPriority() < MIN_PRIORITY || request.getPriority() > MAX_PRIORITY) {
                errors.add("Ưu tiên phải nằm trong khoảng " + MIN_PRIORITY + " - " + MAX_PRIORITY);
            }
        }

        // Validate linkUrl if provided
        if (StringUtils.hasText(request.getLinkUrl())) {
            String linkUrl = request.getLinkUrl().trim();
            if (!URL_PATTERN.matcher(linkUrl).matches() && !linkUrl.startsWith("/")) {
                errors.add("Link không đúng định dạng URL");
            }
        }

        // Validate startAt and endAt
        if (request.getStartAt() != null && request.getEndAt() != null) {
            if (request.getStartAt().isAfter(request.getEndAt())) {
                errors.add("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc");
            }
        }

        // Validate code uniqueness
        if (StringUtils.hasText(request.getCode())) {
            boolean exists;
            if (excludeId != null) {
                exists = bannerRepository.existsByCodeAndIdNot(request.getCode(), excludeId);
            } else {
                exists = bannerRepository.existsByCode(request.getCode());
            }
            if (exists) {
                errors.add("Mã banner đã tồn tại");
            }
        }

        if (!errors.isEmpty()) {
            throw new ValidationException(errors);
        }
    }

    private void mapRequestToEntity(Banner banner, BannerRequest request) {
        if (StringUtils.hasText(request.getCode())) {
            banner.setCode(request.getCode().trim());
        }
        banner.setTitle(request.getTitle().trim());
        banner.setSubtitle(StringUtils.hasText(request.getSubtitle()) ? request.getSubtitle().trim() : null);
        banner.setDescription(StringUtils.hasText(request.getDescription()) ? request.getDescription().trim() : null);
        banner.setImageUrl(request.getImageUrl().trim());
        banner.setMobileImageUrl(StringUtils.hasText(request.getMobileImageUrl()) ? request.getMobileImageUrl().trim() : null);
        banner.setLinkUrl(StringUtils.hasText(request.getLinkUrl()) ? request.getLinkUrl().trim() : null);
        banner.setLinkTarget(request.getLinkTarget() != null ? request.getLinkTarget() : LinkTarget.SAME_TAB);
        banner.setPosition(request.getPosition());
        banner.setType(request.getType() != null ? request.getType() : BannerType.IMAGE);
        banner.setStatus(request.getStatus() != null ? request.getStatus() : EntityStatus.ACTIVE);
        banner.setPriority(request.getPriority() != null ? request.getPriority() : 0);
        banner.setStartAt(request.getStartAt());
        banner.setEndAt(request.getEndAt());
        banner.setButtonText(StringUtils.hasText(request.getButtonText()) ? request.getButtonText().trim() : null);
        banner.setBackgroundColor(StringUtils.hasText(request.getBackgroundColor()) ? request.getBackgroundColor().trim() : null);
    }

    private BannerResponse toResponse(Banner banner) {
        return BannerResponse.builder()
                .id(banner.getId())
                .code(banner.getCode())
                .title(banner.getTitle())
                .subtitle(banner.getSubtitle())
                .description(banner.getDescription())
                .imageUrl(banner.getImageUrl())
                .mobileImageUrl(banner.getMobileImageUrl())
                .linkUrl(banner.getLinkUrl())
                .linkTarget(banner.getLinkTarget())
                .position(banner.getPosition())
                .type(banner.getType())
                .status(banner.getStatus())
                .priority(banner.getPriority())
                .startAt(banner.getStartAt())
                .endAt(banner.getEndAt())
                .buttonText(banner.getButtonText())
                .backgroundColor(banner.getBackgroundColor())
                .createdDate(banner.getCreatedDate())
                .lastModifiedDate(banner.getLastModifiedDate())
                .build();
    }
}
