package com.example.datn.core.admin.discount.service;

import com.example.datn.core.admin.discount.model.DiscountRequest;
import com.example.datn.core.admin.discount.model.DiscountResponse;
import com.example.datn.core.admin.vouchers.model.request.ADVoucherSearchRequest;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.Discount;
import org.springframework.data.domain.Page;

public interface DiscountService {
    ResponseObject<?> getAll(ADVoucherSearchRequest request);
    ResponseObject<?> getOne(String id);
    Discount add(DiscountRequest request);
    Discount update(String id, DiscountRequest request);
    void changeStatus(String id); // Chuyển trạng thái Kích hoạt/Ngưng kích hoạt
    void autoUpdateStatus();
}
