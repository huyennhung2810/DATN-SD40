package com.example.datn.core.admin.discount.service;

import com.example.datn.core.admin.discount.model.ADDiscountSearchRequest;
import com.example.datn.core.admin.discount.model.PostOrPutDiscountDto;
import com.example.datn.core.common.base.ResponseObject;
import org.springframework.stereotype.Service;

@Service
public interface ADDiscountService {
    ResponseObject<?> getAllDiscounts(ADDiscountSearchRequest request);

    ResponseObject<?> getById(String id);

    ResponseObject<?> createOrUpdate(String id, PostOrPutDiscountDto dto);

    ResponseObject<?> delete(String id);
}
