package com.example.datn.service.banner;

import com.example.datn.dto.banner.BannerRequest;
import com.example.datn.dto.banner.BannerResponse;
import com.example.datn.dto.banner.BannerSearchRequest;
import com.example.datn.infrastructure.constant.BannerPosition;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.exception.ServiceException;
import com.example.datn.infrastructure.exception.ValidationException;
import org.springframework.data.domain.Page;

import java.util.List;

public interface BannerService {

    /**
     * Search banners with pagination and filters (Admin)
     */
    Page<BannerResponse> search(BannerSearchRequest request);

    /**
     * Get banner by ID
     */
    BannerResponse getById(String id) throws ServiceException;

    /**
     * Create new banner
     */
    BannerResponse create(BannerRequest request) throws ValidationException, ServiceException;

    /**
     * Update banner
     */
    BannerResponse update(String id, BannerRequest request) throws ValidationException, ServiceException;

    /**
     * Delete banner (soft delete - set status to DELETED)
     */
    void delete(String id) throws ServiceException;

    /**
     * Change banner status quickly
     */
    BannerResponse changeStatus(String id, EntityStatus status) throws ServiceException;

    /**
     * Get active banners for client by position
     */
    List<BannerResponse> getActiveBanners(BannerPosition position);

    /**
     * Get all active banners for client
     */
    List<BannerResponse> getAllActiveBanners();
}
