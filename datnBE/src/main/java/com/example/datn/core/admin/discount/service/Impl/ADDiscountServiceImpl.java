package com.example.datn.core.admin.discount.service.Impl;

import com.example.datn.core.admin.discount.model.ADDiscountSearchRequest;
import com.example.datn.core.admin.discount.model.PostOrPutDiscountDto;
import com.example.datn.core.admin.discount.repository.ADDiscountRepository;
import com.example.datn.core.admin.discount.service.ADDiscountService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.Discount;
import com.example.datn.utils.Helper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;


@Service
@RequiredArgsConstructor
public class ADDiscountServiceImpl implements ADDiscountService {
    private final ADDiscountRepository adDiscountRepository;

    @Override
    public ResponseObject<?> getAllDiscounts(ADDiscountSearchRequest request) {
        // Sử dụng org.springframework.data.domain.Pageable
        Pageable pageable = Helper.createPageable(request);

        Page<Discount> page = adDiscountRepository.getAllDiscounts(
                pageable,
                request.getKeyword(),
                request.getStatus(),
                request.getStartDate(),
                request.getEndDate()
        );

        return ResponseObject.success(PageableObject.of(page), "Lấy danh sách đợt giảm giá thành công");
    }

    @Override
    public ResponseObject<?> getById(String id) {
        return adDiscountRepository.findById(id)
                .map(d -> ResponseObject.success(d, "Lấy chi tiết thành công"))
                .orElse(ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy đợt giảm giá ID: " + id));
    }

    @Override
    @Transactional
    public ResponseObject<?> createOrUpdate(String id, PostOrPutDiscountDto dto) {
        // 1. Validate logic: Ngày kết thúc phải sau ngày bắt đầu
        if (dto.getEndDate() != null && dto.getStartDate() != null
                && dto.getEndDate() <= dto.getStartDate()) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Ngày kết thúc phải lớn hơn ngày bắt đầu");
        }

        // 2. Kiểm tra trùng mã (Dựa trên cột 'code' trong ảnh DB của bạn)
        String currentId = (id != null) ? id : "";
        if (adDiscountRepository.existsByCodeAndIdNot(dto.getCode(), currentId)) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Mã giảm giá '" + dto.getCode() + "' đã tồn tại");
        }

        Discount discount;
        long currentTime = System.currentTimeMillis();

        if (id != null && !id.isEmpty()) {
            // Update
            discount = adDiscountRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy dữ liệu để cập nhật"));
            discount.setLastModifiedDate(currentTime);
        } else {
            // Create
            discount = new Discount();
            discount.setId(UUID.randomUUID().toString());
            discount.setCreatedDate(currentTime);
            discount.setLastModifiedDate(currentTime);
        }

        // Mapping dữ liệu (Khớp với các cột code, name, discount_percent trong ảnh)
        discount.setCode(dto.getCode());
        discount.setName(dto.getName());
        discount.setDiscountPercent(dto.getDiscountPercent()); // DECIMAL(38,2) trong DB -> BigDecimal trong Java
        discount.setStartDate(dto.getStartDate());
        discount.setEndDate(dto.getEndDate());
        discount.setNote(dto.getNote());
        discount.setStatus(dto.getStatus());
        discount.setQuantity(dto.getQuantity());

        return ResponseObject.success(adDiscountRepository.save(discount), "Lưu đợt giảm giá thành công");
    }

    @Override
    @Transactional
    public ResponseObject<?> delete(String id) {
        if (!adDiscountRepository.existsById(id)) {
            return ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy đợt giảm giá để xóa");
        }
        adDiscountRepository.deleteById(id);
        return ResponseObject.success(null, "Xóa thành công");
    }
}